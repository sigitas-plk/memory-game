import { describe, it, expect, beforeEach } from "vitest";
import { GameStateService } from "./game-state-service";
import { DEFAULT_SETTINGS } from "./types";

describe("GameStateService", () => {
  let service: GameStateService;

  beforeEach(() => {
    // start each test with a fresh service using default settings
    service = new GameStateService();
  });

  it("initial state is idle and empty", () => {
    const state = service.getState();
    expect(state.phase).toBe("idle");
    expect(state.cards).toHaveLength(0);
    expect(state.moveCount).toBe(0);
    expect(state.selectedCards).toHaveLength(0);
  });

  it("startGame creates a shuffled deck with correct pair count", () => {
    service.startGame(4); // 4 pairs => 8 cards
    const state = service.getState();

    expect(state.phase).toBe("playing");
    expect(state.cards).toHaveLength(8);
    // each imageId should appear exactly twice
    const counts: Record<number, number> = {};
    state.cards.forEach((c) => {
      counts[c.imageId] = (counts[c.imageId] ?? 0) + 1;
    });
    Object.values(counts).forEach((cnt) => expect(cnt).toBe(2));

    // ensure all cards start face‑down and unmatched
    state.cards.forEach((c) => {
      expect(c.isFlipped).toBe(false);
      expect(c.isMatched).toBe(false);
    });
  });

  it("selecting a matching pair marks cards as matched", async () => {
    service.startGame(2); // 4 cards, 2 pairs
    const stateBefore = service.getState();

    // Find two cards that share the same imageId
    const pair = stateBefore.cards.reduce<Record<number, string[]>>(
      (acc, card) => {
        (acc[card.imageId] ??= []).push(card.id);
        return acc;
      },
      {},
    );
    const matchingIds = Object.values(pair).find((ids) => ids.length === 2)!;

    // Select first card
    await service.selectCard(matchingIds[0]);
    let stateMid = service.getState();
    expect(stateMid.phase).toBe("playing");
    expect(stateMid.cards.find((c) => c.id === matchingIds[0])?.isFlipped).toBe(
      true,
    );

    // Select second card (match)
    await service.selectCard(matchingIds[1]);
    const stateAfter = service.getState();

    // Both cards should be matched and stay flipped
    const first = stateAfter.cards.find((c) => c.id === matchingIds[0])!;
    const second = stateAfter.cards.find((c) => c.id === matchingIds[1])!;
    expect(first.isMatched && second.isMatched).toBe(true);
    expect(first.isFlipped && second.isFlipped).toBe(true);
    expect(stateAfter.moveCount).toBe(1);
    expect(stateAfter.phase).toBe("playing"); // still playing unless all matched
  });

  it("selecting a non‑matching pair flips cards back", async () => {
    service.startGame(3); // 6 cards, 3 pairs

    // Reduce the flip delay for test speed
    // @ts-ignore – accessing private state for test purposes
    service["state"].settings.flipDelay = 0.01;

    const state = service.getState();

    // Find two cards with different imageIds
    const first = state.cards[0];
    const second = state.cards.find((c) => c.imageId !== first.imageId)!;

    await service.selectCard(first.id);
    await service.selectCard(second.id);
    const after = service.getState();

    // Both cards should be face‑down again and not matched
    const f1 = after.cards.find((c) => c.id === first.id)!;
    const f2 = after.cards.find((c) => c.id === second.id)!;
    expect(f1.isFlipped).toBe(false);
    expect(f2.isFlipped).toBe(false);
    expect(f1.isMatched).toBe(false);
    expect(f2.isMatched).toBe(false);
    expect(after.moveCount).toBe(1);
    expect(after.phase).toBe("playing");
  });

  it("game completes when all pairs are matched", async () => {
    service.startGame(2); // 4 cards, 2 pairs
    const initial = service.getState();

    // Group cards by imageId
    const groups: Record<number, string[]> = {};
    initial.cards.forEach((c) => {
      (groups[c.imageId] ??= []).push(c.id);
    });

    // Match first pair
    const firstPair = Object.values(groups)[0];
    await service.selectCard(firstPair[0]);
    await service.selectCard(firstPair[1]);

    // Match second pair
    const secondPair = Object.values(groups)[1];
    await service.selectCard(secondPair[0]);
    await service.selectCard(secondPair[1]);

    const finalState = service.getState();
    expect(finalState.phase).toBe("completed");
    expect(finalState.moveCount).toBe(2);
    finalState.cards.forEach((c) => {
      expect(c.isMatched).toBe(true);
      expect(c.isFlipped).toBe(true);
    });
  });

  it("reset brings the service back to idle state", async () => {
    service.startGame(3);
    await service.selectCard(service.getState().cards[0].id);
    service.reset();

    const resetState = service.getState();
    expect(resetState.phase).toBe("idle");
    expect(resetState.cards).toHaveLength(0);
    expect(resetState.moveCount).toBe(0);
    expect(resetState.elapsedTime).toBe(0);
    expect(resetState.settings).toEqual(DEFAULT_SETTINGS);
  });
});
