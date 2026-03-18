# Enhancing LLM-based Specification Generation via Program Slicing and Logical Deletion

**Zehan Chen¹, Long Zhang³, Zhiwei Zhang¹, JingJing Zhang⁴, Ruoyu Zhou¹, Yulong Shen¹, JianFeng Ma², and Lin Yang⁵***

¹ School of Computer Science and Technology, Xidian University, Xi'an, Shaanxi, China  
² School of Cyber Engineering, Xidian University, Xi'an, Shaanxi, China  
³ National Key Laboratory of Science and Technology on Information System Security, AMS, Beijing, China  
⁴ Unit 32092 of PLA, Beijing, China  
⁵ National Key Laboratory of Science and Technology on Information System Security, Systems Engineering Institute, AMS, Beijing, China  

*\* Corresponding author*  
*arXiv:2509.09917v2 [cs.SE] 2 Feb 2026*

---

## Abstract

Traditional formal specification generation methods are typically tailored to specific specification types, and therefore suffer from limited generality. In recent years, large language model (LLM)-based specification generation approaches have emerged, offering a new direction for improving the universality of automated specification synthesis. However, when dealing with complex control flow, LLMs often struggle to precisely generate complete specifications that cover substructures. Moreover, the distinctive verification pipelines adopted by existing approaches may incorrectly discard logically correct specifications, while verification tools alone cannot reliably identify correct specifications.

To address these issues, we propose **SLD-Spec**, an LLM-based specification generation method that combines program slicing and logical deletion. Specifically, SLD-Spec augments the conventional specification generation framework with two key stages:

1. A **program slicing** stage that decomposes the target function into several smaller code slices, enabling LLMs to focus on more localized semantic structures and thereby improving specification relevance and completeness.
2. A **logical deletion** stage that leverages LLMs to perform logical reasoning and filtering over candidate specifications so as to retain logically correct ones.

Experimental results show that SLD-Spec consistently outperforms existing methods on datasets containing programs of varying complexity, verifying more programs and generating specifications that are more relevant and more complete. Further ablation studies indicate that program slicing mainly improves specification relevance and completeness, whereas logical deletion plays a key role in increasing verification success rates.

**Keywords:** Specification Generation · Large Language Models · Program Slicing · Logical Deletion

---

## 1 Introduction

In program verification, formal specifications are used to precisely characterize program behaviors and the properties they are required to satisfy, thereby addressing the ambiguity that often arises when software requirements are described in natural language. However, manually writing such specifications is highly labor-intensive. Traditional research on automated specification generation typically focuses on only specific types of specifications, which limits their generality. Recent studies have begun to leverage the strong comprehension and generation capabilities of large language models (LLMs) to automatically generate a wide range of specifications for programs.

Although the introduction of LLMs addresses the issue of diversity in specification generation, this line of research has not yet been thoroughly explored and still suffers from the following three major challenges:

- **Complex control flow** within a function makes it difficult for LLMs to accurately distinguish the scopes of different substructures, leading them to generate specifications that do not belong to the target substructure or to omit critical ones.
- **Existing verification pipelines** apply verification tools immediately after generating specifications for substructures to reduce the risk of error propagation. However, due to the lack of necessary contextual information, this practice may incorrectly eliminate specifications that are logically correct.
- Some studies leverage LLMs to generate a large number of candidate specifications and then perform filtering, but **verification tools are designed for rigorous proof checking rather than discriminative selection**. This mismatch makes the use of verification tools to filter specifications unreliable.

To address the above challenges, we introduce two core strategies:

1. Before generating specifications, we decompose functions into smaller slices. This reduces the amount of code provided to LLMs in each query and prevents irrelevant content from influencing specification generation.
2. After generating specifications for substructures, we do not rely on verification tools to filter out specifications that fail verification. Instead, inspired by the "LLM-as-a-Judge" paradigm, we use LLMs to assess the consistency between the generated specifications and the code, thereby temporarily retaining logically correct specifications.

Based on these insights, we propose **SLD-Spec**, a novel LLM-based specification generation approach enhanced by program slicing and logical deletion. It extends the traditional guess-and-verify paradigm into an automated specification generation framework consisting of four phases: **slice–guess–logical delete–verify**.

### Contributions

- We propose **SLD-Spec**, a novel automated specification generation approach that leverages program slicing to decompose complex functions into code slices and logical deletion to mitigate over-pruning of logically correct specifications.
- We construct a **program dataset with complex control flow**. Compared with prior work, this dataset contains longer code and more intricate control structures, along with extended evaluation metrics.
- We compare SLD-Spec with two SOTA approaches. SLD-Spec successfully verifies **37 out of 51** programs and **10 out of 11** programs on the two datasets, respectively, outperforming the baseline approaches.
- All tools, datasets, and experimental results are publicly released to support further research.

---

## 2 Background and Motivation

### 2.1 Program Slicing

Program slicing is a technique for automatically decomposing programs by analyzing their data and control flow. It begins with a subset of the program's behavior and simplifies the program to the minimal form, while still preserving that behavior. A slice consists of the portions of the program that may affect the values computed at points of interest, known as **slicing criteria**. These criteria are represented by a tuple ⟨p, V⟩, where *p* denotes a specific point in the program and *V* is a subset of the program's variables.

### 2.2 Specification Language

A specification language is a mathematically and logically grounded formalism used to formally and precisely describe a system's requirements, behaviors, and properties. This work focuses on the **ANSI/ISO C Specification Language (ACSL)** for C programs. ACSL primarily provides:

- **Function contracts**: use `requires`, `ensures`, and `assigns` clauses to specify preconditions, postconditions, and permissible side effects.
- **Loop annotations**: include `loop invariant` clauses (properties preserved across iterations), `loop assigns` clauses (restrict memory modifications), and `loop variant` clauses (ensure loop termination).

### 2.3 Motivating Example

The figure below illustrates the specifications generated by existing approaches for a function containing two loop structures, revealing several issues.

```c
void func(int x, int y, int* x_res, int* prod_res){
    int a = x;
    int c = x;
    *x_res = 0;
    *prod_res = 0;
    while(a != 0) {           // Loop 1
        *x_res = *x_res + 1;
        a = a - 1;
    }
    while(c > 0) {            // Loop 2
        *prod_res = *prod_res + y;
        c--;
    }
}

int main(){
    int x_res, prod_res;
    func(3, 10, &x_res, &prod_res);
    //@ assert x_res == 3;
    //@ assert prod_res == 30;
}
```

**Issues identified in existing approaches:**

| Loop | Spec | Issue |
|------|------|-------|
| Loop 1 | `(b) loop invariant c >= 0` | Semantically unrelated to Loop 1 |
| Loop 1 | `(c) loop invariant *prod_res == y * (x - c)` | Belongs to Loop 2, not Loop 1 |
| Loop 1 | `(a) loop invariant a >= 0` | Correct but removed due to missing precondition `requires x >= 0` |
| Loop 2 | `(h)–(j)` | Misaligned specifications copied from Loop 1 |
| Both | `(f)/(g) loop variant a/c` | Multiple loop variant clauses cause syntactic errors |

These issues stem from inherent limitations: context-dependent generation, hierarchical dependencies among specifications, and mismatches between LLMs and verification tools.

---

## 3 Methodology

The overview of SLD-Spec comprises four main phases: **Slicing → Guessing → Logical Deletion → Verification**.

### 3.1 Program Slicing

SLD-Spec constructs an abstract syntax tree (AST) by traversing the program's source code to identify call relationships between functions, creating a **Function Call Graph (FCG)**. This reduces specification generation complexity from the program level to the function level.

Unlike AutoSpec, which directly generates specifications for loops and functions, SLD-Spec introduces the concept of slicing, establishing a **"loop–slice–function–program"** sequence for specification generation. This offers two advantages:

1. Reduces the complexity of functions, enabling LLMs to interpret function contents more accurately.
2. Groups related code into the same slice, preventing LLMs from being misled by irrelevant specifications.

#### Algorithm 1: Automatic Function Slicing

```
Input:  F — the function to be sliced
Output: Sfs — the set of function slices

AutoSlicing(F):
  Sfs = ∅, Ssc = ∅
  if F is not called then
    GenCallFunc(F)           // generate wrapper call function
  Svar ← GetFuncVar(F)      // get local variables (excluding loop-defined vars)
  for v ∈ Svar do
    sc ← InsSliCrit(F, v)   // construct slicing criterion
    Ssc.append(sc)
  for s ∈ Ssc do
    fs ← Slicing(F, s)      // generate slice
    if fs not empty then
      Sfs.append(fs)
  Sfs ← SimplifySlicing(Sfs) // reduce redundancy
  return Sfs
```

#### Algorithm 2: Simplified Slice Set

```
Input:  S — the set of slices
Output: Sss — the set of selected slices

SimplifySlicing(S):
  Sas = all statements across all slices
  Scs = ∅, Sss = ∅
  while Scs ≠ Sas do
    best_slice = slice in S covering the most uncovered statements
    Sss.append(best_slice)
    Scs.update(best_slice)
    S.remove(best_slice)
  return Sss
```

Variables defined inside loops are excluded from slicing criteria, as their resulting slices are typically subsumed by slices generated from variables defined outside loops.

### 3.2 Specification Generation

SLD-Spec feeds function slices into LLMs for specification generation. If a slice contains substructures, specifications are generated for these with priority. Each prompt consists of three parts:

1. **Role setting** — defines the LLM's role in the dialogue
2. **Few-shot examples** — helps the LLM learn the desired output format
3. **Slice code** — the target slice for generation

### 3.3 Logical Deletion

To mitigate correct specifications being discarded due to insufficient context, we introduce a **logical deletion phase** between generation and verification. This phase uses LLMs to assess the plausibility and potential satisfiability of specifications via a four-step chain-of-thought process:

1. **Exclusion** — filter specifications whose variables do not appear in the current code
2. **Comprehension** — interpret each candidate specification in informal natural language
3. **Reasoning** — treat interpretations as design requirements and reason whether the program satisfies them
4. **Output** — output `true` or `false` for each specification

#### Table 1: Common Erroneous Specification Types

| Type | Error Type | Example | Explanation |
|------|-----------|---------|-------------|
| `loop invariant` | Incorrect Boundary Condition | `loop invariant c < x;` | `c` equals `x` after the loop fully executes |
| `loop invariant` | Incorrect Pattern Summarization | `loop invariant *prod_res == x * y;` | Should be `(x - c) * y`, not `x * y` |
| `loop invariant` | Invariant Misalignment | `loop invariant *x_res == x - a;` | `*x_res` does not exist in Loop 2 |
| `loop assigns` | False Modifiability | `loop assigns y;` | Variable `y` is not modified in the loop |
| `loop assigns` | Assigns Misalignment | `loop assigns *x_res;` | `*x_res` does not exist in Loop 2 |
| `loop variant` | Uniqueness Conflict | `loop variant c;` + `loop variant x - c;` | Multiple loop variants defined — syntax error |
| `loop variant` | Invalid Definition | `loop variant x - c;` | Expression does not satisfy decrease requirement |

### 3.4 Specification Verification

SLD-Spec delays verification until specifications for **all slices of the same function** have been generated. This is because:

1. Different slices may produce identical specifications — verifying each individually wastes time.
2. A specification correct for an individual slice may not hold for the entire function (e.g., `assigns nothing` becomes incorrect if other slices modify variables).

SLD-Spec uses the **Frama-C** verification tool. If verification fails, incorrect specifications are identified and removed, and re-verification is repeated until all specifications are either removed or successfully verified.

---

## 4 Evaluation

Four research questions are addressed:

- **RQ1**: Performance on simple programs (frama-c-problems dataset)
- **RQ2**: Performance on complex control flow (complex-func dataset)
- **RQ3**: Ablation study — impact of program slicing and logical deletion

### 4.1 Experimental Setup

| Component | Choice |
|-----------|--------|
| Program slicing tool | DG (static backward slicing via program dependence graphs) |
| LLM API | OpenAI API (temperature = 0.7, max_tokens = 2048) |
| Verification tool | Frama-C (weakest precondition plugin, timeout = 8s) |
| Hardware | Intel Core i9-13900K, 64 GB RAM, NVIDIA RTX 4080, Ubuntu 22.04 |

**Baselines:**
- **AutoSpec** — combines LLMs with static analysis and hierarchical generation
- **SpecGen** — conversation-driven approach with heuristic mutation-based selection

**Datasets:**
- **frama-c-problems** — 51 simple programs in 8 categories
- **complex-func** (newly constructed) — 11 programs in 4 categories:
  - *Parallel Single-Path Loop*: multiple parallel loops, each single-path
  - *Single Multi-Path Loop*: one loop with multiple branch statements
  - *Conditional-Enhanced Single-Path Loop*: parallel loops plus an additional branch
  - *Nested Loop*: nested structures, each inner loop performing a distinct task

**Evaluation Metrics:**
- **PCRSAV** — Proportion of Correct and Relevant Specifications After Verification
- **NAV** — Number of Assertions Passed Verification
- **NPP** — Number of Program Verification Passes (over 5 runs)
- **RT** — Running Time (seconds)

### 4.2 Experimental Results

#### RQ1: frama-c-problems Dataset

| Method | Programs Verified (of 51) | Avg. Runtime (s) |
|--------|--------------------------|-----------------|
| AutoSpec | 27 | 100.21 |
| SpecGen | 36 | 42.04 |
| **SLD-Spec** | **37** | **27.85** |

Key observations:
- For programs **without loops** (NoL = 0), all approaches perform comparably.
- For programs **with loops** (NoL > 0), AutoSpec's verification success rate drops significantly due to premature discarding of specifications before preconditions are generated.
- SLD-Spec avoids iterative regeneration overhead, achieving the lowest average runtime.

<details>
<summary>Full results table (frama-c-problems)</summary>

| Program | LoC | NoL | AutoSpec NPP | SpecGen NPP | SLD-Spec NPP |
|---------|-----|-----|-------------|------------|-------------|
| absolute_value.c | 13 | 0 | 5/5 | 5/5 | 5/5 |
| add.c | 14 | 0 | 5/5 | 5/5 | 5/5 |
| ani.c | 15 | 1 | 0/5 | 3/5 | 3/5 |
| diff.c | 8 | 0 | 5/5 | 5/5 | 5/5 |
| gcd.c | 17 | 0 | 0/5 | 0/5 | 0/5 |
| max_of_2.c | 12 | 0 | 5/5 | 5/5 | 5/5 |
| power.c | 17 | 1 | 0/5 | 0/5 | 0/5 |
| simple_interest.c | 10 | 0 | 5/5 | 5/5 | 5/5 |
| swap.c | 12 | 0 | 5/5 | 5/5 | 5/5 |
| div_rem.c | 11 | 0 | 5/5 | 0/5 | 5/5 |
| incr_a_by_b.c | 12 | 0 | 5/5 | 0/5 | 5/5 |
| reset_1st.c | 14 | 0 | 3/5 | 1/5 | 5/5 |
| 1.c (loops) | 8 | 1 | 5/5 | 5/5 | 5/5 |
| mult.c | 13 | 1 | 0/5 | 5/5 | 4/5 |
| sum_even.c | 14 | 1 | 0/5 | 4/5 | 5/5 |
| sample.c | 13 | 1 | 0/5 | 0/5 | 5/5 |
| search_2.c | 16 | 1 | 0/5 | 5/5 | 5/5 |
| *(+ 34 more programs)* | | | | | |
| **Overall** | | | **27** | **36** | **37** |

</details>

#### RQ2: complex-func Dataset

| Category | AutoSpec NPP | SpecGen NPP | SLD-Spec NPP |
|----------|-------------|------------|-------------|
| Parallel Single-Path Loop (3 programs) | 0% | 0% | **100%** |
| Single Multi-Path Loop (3 programs) | 0% | 0% | **66.67%** |
| Conditional-Enhanced Single-Path Loop (3 programs) | 0% | 0% | **86.67%** |
| Nested Loop (2 programs) | 0% | **100%** | 70% |
| **Total programs verified** | **0** | **2** | **10** |

**PCRSAV comparison:**

| Category | AutoSpec | SpecGen | SLD-Spec |
|----------|---------|---------|---------|
| Parallel Single-Path Loop | 45.26% | 55.47% | **100%** |
| Single Multi-Path Loop | 91.41% | 61.64% | **99.86%** |
| Conditional-Enhanced | 44.56% | 69.93% | **100%** |
| Nested Loop | 65.43% | 98.56% | **100%** |

SLD-Spec achieves PCRSAV close to or reaching 100% across all categories, attributable to the synergy between program slicing (reduces cross-loop interference) and logical deletion (avoids premature discarding).

#### RQ3: Ablation Study

| Variant | Description | Programs Verified |
|---------|-------------|------------------|
| SLD-Spec w/o both | No slicing, no logical deletion | 0 |
| SLD-Spec w/o LD | Program slicing only | 0 |
| SLD-Spec w/o PS | Logical deletion only | 8 |
| **SLD-Spec** | Both components | **10** |

Key findings:
- **Program slicing alone** significantly improves PCRSAV but does not improve verification success rate (NPP remains 0%), because logical correctness issues persist.
- **Logical deletion alone** improves both PCRSAV and NPP, achieving 8 verified programs, but stability is still affected by LLM non-determinism.
- **Combined**, SLD-Spec achieves the highest performance on all metrics.

---

## 5 Threats to Validity

1. **Data leakage risk**: The frama-c-problems dataset has been available for some time and may appear in LLM training data. However, all methods are evaluated under identical settings, so relative comparisons remain valid. The newly constructed complex-func dataset was not publicly released prior to this work.

2. **Reliability of logical deletion**: LLMs' inherent non-determinism may cause incorrect judgments. Mitigated by a **multi-sampling voting mechanism** (majority vote across multiple invocations).

3. **Limited dataset size**: 51 + 11 programs may not fully represent real-world software complexity. Future work will construct larger, more diverse datasets.

---

## 6 Related Work

### 6.1 Traditional Specification Generation Approaches

| Category | Approach | Examples | Limitations |
|----------|----------|---------|------------|
| Static Analysis (SA)-based | Analyze source code via abstract interpretation or predicate mining | Alur et al. (L* learning for Java interfaces) | Limited scalability with complex data structures |
| Dynamic Detection (DD)-based | Execute test cases and trace runtime states | Daikon (dynamic invariant detection) | Effectiveness depends on test case coverage |
| Machine Learning (ML)-based | Learn from execution traces via neural networks | CODE2INV (graph neural networks + RL for loop invariants) | Requires large amounts of high-quality training data |

### 6.2 LLM-based Specification Generation Approaches

Recent notable work includes:

- **Xie et al.** — first evaluation of LLMs generating specifications from software comments/documentation
- **Pei et al.** — fine-tuned LLMs for program invariant generation
- **Kamath et al.** — earliest LLM-based automated framework (guess-and-verify)
- **AutoSpec (Wen et al.)** — hierarchical decomposition with bottom-up incremental generation
- **SpecGen (Ma et al.)** — conversational paradigm for Java programs with heuristic mutation
- **LEMUR (Wu et al.)** — proof calculus combining LLMs with automated reasoners

SLD-Spec focuses on addressing critical deficiencies in current frameworks: semantic interference during generation and overly aggressive/unreliable filtering during verification.

---

## 7 Conclusion

We propose **SLD-Spec**, an LLM-based specification generation approach enhanced by program slicing and logical deletion. Our approach decomposes functions into smaller slices and uses LLMs to filter logically correct specifications. Experimental results show that SLD-Spec outperforms other baselines in both verification capability and efficiency, effectively improving the program verification success rate.

---

## Appendix A: Case Studies of Verification Failure

### A.1 Case 1: Complex Control Flow Causes Verification Failures in SpecGen

Given a function with two loops, a conditional branch, and division, SpecGen generates correct loop specifications but produces an incomplete function contract. During repair, it supplements some postconditions but consistently fails to generate two crucial preconditions: `requires \separated(prod_res, y_res, x_res)` and `requires x >= 0`. The absence of these causes other logically correct specifications to fail verification. SpecGen then **mutates the failing specifications**, incorrectly modifying originally correct ones and further exacerbating errors.

### A.2 Case 2: Immediate Verification After Generation Causes Failures in AutoSpec

For a simple counting function, AutoSpec generates loop specifications before generating function contracts. The specification `loop invariant 0 <= x` requires the precondition `requires c >= 0`, which has not yet been generated. The verification tool removes this specification. Subsequently, the postcondition `ensures \result == c` fails to verify because proving `y == c` requires establishing `x == 0` from the loop exit condition. Without the lower bound `0 <= x`, the verification tool can only derive `x <= 0` and times out attempting to prove `x == 0`.

### A.3 Case 3: Limitations of Using Verification Tools to Filter Specifications

AutoSpec generates three `loop variant` clauses for a loop (`loop variant a`, `loop variant d`, `loop variant x - a`) and attempts to eliminate incorrect ones via the verification tool. However, the tool treats the **earliest clause as a syntactic error** rather than reasoning mathematically. After two rounds of verification, the loop retains the incorrect clause `loop variant x - a`, which propagates to the second loop, causing both loops to retain incorrect loop variant clauses.

### A.4 Case 4: Programs Failing Verification by SLD-Spec

The program `only-single-loop-4.c` (single loop with four `if` branches) is not verifiable under SLD-Spec's current configuration because proving some generated specifications requires **several hundred seconds** — far exceeding the 8-second timeout. When manually tested with a 300-second timeout and manual elimination of incorrect specifications, the program verified successfully. This indicates a configuration limitation rather than an inherent algorithmic failure.

---

*arXiv:2509.09917v2 [cs.SE] 2 Feb 2026*
