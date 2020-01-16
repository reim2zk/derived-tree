import {Term} from './Term'

export interface Relation {
    terms(): Term[]
    toString(): string
}

export class TextRelation implements Relation {
    text: string
    terms(): Term[] { return [] }
    toString(): string { return this.text }
    constructor(text: string) {
        this.text = text
    }
}

export class EvalRelation implements Relation {
    t1: Term
    t2: Term
    terms(): Term[] { return [this.t1, this.t2]}
    constructor(t1: Term, t2: Term) {
        this.t1 = t1
        this.t2 = t2
    }
    toString(): string {
        const s1 = this.t1.toString()
        const s2 = this.t2.toString()
        return `${s1} -> ${s2}`
    }
}

