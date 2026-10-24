// ── The programs the C++ lifetime figure can step through ─────────────────────
// Code stays in English; explanations are tx keys (figCppLife_…). Noisy is the
// little class from the classes chapter: its constructor prints "+ name" and
// its destructor prints "- name".

import type { LifeProgram } from "./lifeModel";
import { COPY_MOVE_PROGRAMS } from "./copyMovePrograms";
import { OWN_PROGRAMS } from "./ownPrograms";

const scopes: LifeProgram = {
  id: "scopes",
  code: [
    "int main() {",
    "    Noisy a{\"a\"};",
    "    {",
    "        Noisy b{\"b\"};",
    "        Noisy c{\"c\"};",
    "    }",
    "    Noisy d{\"d\"};",
    "}",
  ],
  steps: [
    { line: 0, key: "figCppLife_sc0", en: "main starts. Its body is a scope: the region between a pair of braces. Objects defined in it belong to it.", run: m => m.enter("main()") },
    { line: 1, key: "figCppLife_sc1", en: "The constructor runs the moment a is defined. Noisy's constructor prints + a.", run: m => m.make("a", "Noisy", { print: "+ a" }) },
    { line: 2, key: "figCppLife_sc2", en: "A bare pair of braces opens a new, inner scope.", run: m => m.enter("{ }") },
    { line: 3, key: "figCppLife_sc3", en: "b is built inside the inner scope.", run: m => m.make("b", "Noisy", { print: "+ b" }) },
    { line: 4, key: "figCppLife_sc4", en: "Then c.", run: m => m.make("c", "Noisy", { print: "+ c" }) },
    { line: 5, key: "figCppLife_sc5", en: "The closing brace ends the inner scope, so its objects are destroyed, in reverse order of construction: c first. Nobody wrote this call. The compiler put it there.", run: m => m.kill("c", "- c"), dtor: true },
    { line: 5, key: "figCppLife_sc6", en: "Then b. Last built, first destroyed, like a stack of plates: an object built later may use the ones built before it, so it must go first.", run: m => m.kill("b", "- b"), dtor: true },
    { line: 5, key: "figCppLife_sc7", en: "The inner scope is gone. Nothing in it can be used any more.", run: m => m.exit() },
    { line: 6, key: "figCppLife_sc8", en: "d is built in main's scope, after the inner one has closed.", run: m => m.make("d", "Noisy", { print: "+ d" }) },
    { line: 7, key: "figCppLife_sc9", en: "main's closing brace: the newest object, d, is destroyed first…", run: m => m.kill("d", "- d"), dtor: true },
    { line: 7, key: "figCppLife_sc10", en: "…and a, the first one built, is destroyed last. Read the output: it is a mirror image.", run: m => m.kill("a", "- a"), dtor: true },
    { line: 7, key: "figCppLife_sc11", en: "main returns and the program ends.", run: m => m.exit() },
  ],
};

const members: LifeProgram = {
  id: "members",
  code: [
    "struct Player {",
    "    Noisy name{\"name\"};",
    "    Noisy sword{\"sword\"};",
    "    Player()  { std::println(\"+ player\"); }",
    "    ~Player() { std::println(\"- player\"); }",
    "};",
    "int main() {",
    "    Player p;",
    "}",
  ],
  steps: [
    { line: 6, key: "figCppLife_mb0", en: "main starts.", run: m => m.enter("main()") },
    { line: 7, key: "figCppLife_mb1", en: "Defining p starts building a Player (drawn in amber: under construction). Before its constructor's body may run, every member must already exist.", run: m => m.make("p", "Player", { building: true }) },
    { line: 1, key: "figCppLife_mb2", en: "So the members are built first, in the order they are declared in the class: name…", run: m => m.make("name", "Noisy", { parent: "p", print: "+ name" }) },
    { line: 2, key: "figCppLife_mb3", en: "…then sword.", run: m => m.make("sword", "Noisy", { parent: "p", print: "+ sword" }) },
    { line: 3, key: "figCppLife_mb4", en: "Only now does Player's constructor body run. Inside it, every member is ready to use. p is complete.", run: m => m.built("p", "+ player") },
    { line: 8, key: "figCppLife_mb5", en: "main ends, so p is destroyed. The destructor's body runs first, while the members still exist, so it can still use them.", run: m => m.dying("p", "- player"), dtor: true },
    { line: 4, key: "figCppLife_mb6", en: "Then the members are destroyed, in reverse order: sword…", run: m => m.kill("sword", "- sword"), dtor: true },
    { line: 4, key: "figCppLife_mb7", en: "…then name, and p is gone. Destruction is construction played backwards: body first, then members from last to first.", run: m => { m.kill("name", "- name"); m.kill("p"); }, dtor: true },
    { line: 8, key: "figCppLife_mb8", en: "main returns.", run: m => m.exit() },
  ],
};

const early: LifeProgram = {
  id: "early",
  code: [
    "bool load(bool broken) {",
    "    File file{\"level.dat\"};",
    "    if (broken) return false;",
    "    Buffer buf{1024};",
    "    return true;",
    "}",
    "int main() {",
    "    load(true);",
    "}",
  ],
  steps: [
    { line: 6, key: "figCppLife_er0", en: "main starts.", run: m => m.enter("main()") },
    { line: 7, key: "figCppLife_er1", en: "main calls load(true). The function body is a new scope, and broken is true.", run: m => m.enter("load()") },
    { line: 1, key: "figCppLife_er2", en: "File's constructor opens level.dat. From now on, file owns an open file: something that must be given back.", run: m => m.make("file", "File", { res: "level.dat (open)", print: "open level.dat" }) },
    { line: 2, key: "figCppLife_er3", en: "broken is true, so load returns early. The rest of the body never runs: buf is never built, so it will never be destroyed either." },
    { line: 2, key: "figCppLife_er4", en: "Leaving the function ends file's scope, so its destructor runs and closes the file. Every way out of a scope runs the destructors: the closing brace, return, break, and an exception passing through.", run: m => m.kill("file", "close level.dat"), dtor: true },
    { line: 7, key: "figCppLife_er5", en: "load returns false to main. Check the summary under the drawing: is any resource still held?", run: m => m.exit() },
    { line: 8, key: "figCppLife_er6", en: "main ends.", run: m => m.exit() },
  ],
};

// ── Creating objects: stack, new, make_unique, a temporary ──

const create: LifeProgram = {
  id: "create",
  code: [
    "int main() {",
    "    Noisy a{\"a\"};",
    "    Noisy* p = new Noisy{\"p\"};",
    "    auto u = std::make_unique<Noisy>(\"u\");",
    "    Noisy{\"tmp\"};",
    "    std::println(\"{} {} {}\", a.name, p->name, u->name);",
    "    delete p;",
    "}",
  ],
  steps: [
    { line: 0, key: "figCppLife_cr0", en: "main starts. Its local variables live on the stack, in main's frame.", run: m => m.enter("main()") },
    { line: 1, key: "figCppLife_cr1", en: "a is built right here, on the stack. Its memory is part of main's frame: nobody has to ask for it or give it back.", run: m => m.make("a", "Noisy", { print: "+ a" }) },
    { line: 2, key: "figCppLife_cr2", en: "new finds room on the heap, runs the constructor there (+ p) and returns the address. p is only a pointer, a local like any other; the Noisy it points at has no name and belongs to no scope.", run: m => { m.alloc("#1", "Noisy p"); m.make("p", "Noisy*", { ptr: "#1", print: "+ p" }); } },
    { line: 3, key: "figCppLife_cr3", en: "make_unique does the same new for you and hands the address to u, a unique_ptr that owns the object: when u dies, it deletes it.", run: m => { m.alloc("#2", "Noisy u"); m.make("u", "unique_ptr<Noisy>", { ptr: "#2", print: "+ u" }); } },
    { line: 4, key: "figCppLife_cr4", en: "A Noisy with no variable name: a temporary. It is built…", run: m => m.make("tmp", "Noisy", { print: "+ tmp" }) },
    { line: 4, key: "figCppLife_cr5", en: "…and destroyed at the semicolon, the end of the statement that made it.", run: m => m.kill("tmp", "- tmp"), dtor: true },
    { line: 5, key: "figCppLife_cr6", en: "An object is used with a dot: a.name. A pointer is used with an arrow: p->name means (*p).name, follow the address, then take the member. A unique_ptr behaves like a pointer, so it takes the arrow too.", run: m => { m.touch("a"); m.touch("p"); m.touch("u"); m.print("a p u"); } },
    { line: 6, key: "figCppLife_cr7", en: "delete p runs the destructor (- p) and gives the memory back. p itself still holds the old address: a dangling pointer. Never use it again.", run: m => { m.print("- p"); m.free("#1"); m.point("p", undefined, "dangling"); } },
    { line: 7, key: "figCppLife_cr8", en: "The closing brace destroys main's objects in reverse order. u first: its destructor deletes the Noisy it owns (- u).", run: m => { m.kill("u", "- u"); m.free("#2"); }, dtor: true },
    { line: 7, key: "figCppLife_cr9", en: "Then p. A raw pointer has no destructor: dying deletes nothing. That is why the delete above had to be written by hand.", run: m => m.kill("p"), dtor: true },
    { line: 7, key: "figCppLife_cr10", en: "Then a, the first one built. Every object was destroyed exactly once.", run: m => m.kill("a", "- a"), dtor: true },
    { line: 7, key: "figCppLife_cr11", en: "main returns.", run: m => m.exit() },
  ],
};

const leak: LifeProgram = {
  id: "leak",
  code: [
    "void spawn() {",
    "    Noisy* boss = new Noisy{\"boss\"};",
    "    std::println(\"{} appears\", boss->name);",
    "}",
    "int main() {",
    "    spawn();",
    "    std::println(\"back in main\");",
    "}",
  ],
  steps: [
    { line: 4, key: "figCppLife_lk0", en: "main starts.", run: m => m.enter("main()") },
    { line: 5, key: "figCppLife_lk1", en: "main calls spawn.", run: m => m.enter("spawn()") },
    { line: 1, key: "figCppLife_lk2", en: "new builds a Noisy on the heap, and the local pointer boss holds its address.", run: m => { m.alloc("#1", "Noisy boss"); m.make("boss", "Noisy*", { ptr: "#1", print: "+ boss" }); } },
    { line: 2, key: "figCppLife_lk3", en: "The object is used through the pointer.", run: m => { m.touch("boss"); m.print("boss appears"); } },
    { line: 3, key: "figCppLife_lk4", en: "spawn ends and the pointer boss dies. A raw pointer's death deletes nothing, so the Noisy stays on the heap, and now nobody knows its address. - boss is never printed: that is a leak.", run: m => m.kill("boss"), dtor: true },
    { line: 3, key: "figCppLife_lk5", en: "spawn returns. Look at the summary under the drawing: one block nobody can ever free.", run: m => m.exit() },
    { line: 6, key: "figCppLife_lk6", en: "main carries on as if nothing happened. Call spawn in a loop and the program grows forever.", run: m => m.print("back in main") },
    { line: 7, key: "figCppLife_lk7", en: "main ends. The operating system takes the memory back when the process exits, but the destructor never ran: if it had to save a file or close a connection, that never happened. The fix is one line: auto boss = std::make_unique<Noisy>(\"boss\");.", run: m => m.exit() },
  ],
};

export const LIFE_PROGRAMS = { scopes, members, early, create, leak, ...COPY_MOVE_PROGRAMS, ...OWN_PROGRAMS } as const;
export type LifeProgramId = keyof typeof LIFE_PROGRAMS;
