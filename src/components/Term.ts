export interface Term {
    toString(): string
}

export class TmTrue implements Term {
    toString(): string { return "true" }
}
export class TmFalse implements Term {
    toString(): string { return "false" }
}
export class TmIf implements Term {
    t1: Term
    t2: Term
    t3: Term
    constructor(t1: Term, t2: Term, t3: Term) {
        this.t1 = t1
        this.t2 = t2
        this.t3 = t3
    }
    toString(): string { 
        const st1 = this.t1.toString()
        const st2 = this.t2.toString()
        const st3 = this.t3.toString()
        return `if ${st1} then ${st2} else ${st3}` }
}