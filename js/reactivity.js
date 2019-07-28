class Dep {
  constructor() {
    this.sub = new Set();
  }

  addSub(sub) {
    this.subs.add(sub);
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

Dep.target = null;
const targetStack = [];

function pushTarget(_target) {
  if (Dep.target) {
    targetStack.push(Dep.target);
  }
  Dep.target = _target;
}

class Watcher {
  constructor(getter, cb) {
    this.getter = getter;
    this.cb = cb;
    this.value = this.get();
    this.cb(this.value, null);
  }

  get() {
    pushTarget(this);
    const value = this.getter();
    popTarget();

    return value;
  }

  addDep(dep) {
    dep.addSub(this);
  }

  update() {
    const value = this.get();
    const oldValue = this.value;

    this.cb(value, oldValue);
  }
}

function walk(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], obj[keys[i]]);
  }
}

function defineReactive(obj, key, val) {
  if (val !== null && typeof val === "object") {
    walk(val);
  }

  const dep = new Dep();
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      dep.depend();
      return val;
    },

    set: function reactiveSetter(newVal) {
      val = newVal;
      dep.notify();
    }
  });
}

const foods = { apple: 5 };

walk(foods);

const foodsWatch = new Watcher(() => foods.apple, () => console.log("change"));

foods.apple = 6;
