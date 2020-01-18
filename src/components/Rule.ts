import {Relation} from './Relation'
import {Term, TmIf, TmTrue, TmFalse} from './Term'
import {EvalRelation} from './Relation'

export class Id {
    readonly value: number
    constructor(value: number) {
        this.value = value
    }
    // static notAssignedValue(): number { return -1 }
    // isAssigned(): boolean { return this.value != RuleId.notAssignedValue() }
    // static notAssigned(): RuleId { return new RuleId(RuleId.notAssignedValue()) }
}

export class IdGenerator {
    current: number = 0
    newId(): Id {
        this.current++
        return new Id(this.current)
    }
}

export interface Rule {
    id: Id
    name: string
    relation: Relation | null
    parentIds: (Id | null)[]
}

export class TextRule implements Rule {
    id: Id
    name: string
    relation: Relation | null
    parentIds: (Id | null)[]
    constructor(id: Id, name: string, parentSize: number) {
        this.id = id
        this.name = name
        this.relation = null
        this.parentIds = []
        for(let i = 0; i < parentSize; i++) {
            this.parentIds.push(null)
        }
    }
    setRelation(relation: Relation): void { this.relation = relation }
    setParentRule(idx: number, id: Id): void { this.parentIds[idx] = id }    
}

export class EIfTrue implements Rule {
    id: Id
    name: string
    relation: Relation | null
    parentIds: (Id | null)[]
    t2: Term
    t3: Term
    constructor(id: Id, t2: Term, t3: Term) {
        this.id = id
        this.name = "E-IfTrue"
        this.t2 = t2
        this.t3 = t3

        const cod = new TmIf(TmTrue, this.t2, this.t3)        
        this.relation = new EvalRelation(cod, this.t2)

        this.parentIds = []
    }
}

export class EIfFalse implements Rule {
    id: Id
    name: string
    relation: Relation | null
    parentIds: (Id | null)[] = []
    t2: Term
    t3: Term
    constructor(id: Id, t2: Term, t3: Term) {
        this.id = id
        this.name = "E-IfFalse"
        this.t2 = t2
        this.t3 = t3
        this.relation = this.derive()
    }
    derive(): Relation {
        const cod = new TmIf(TmTrue, this.t2, this.t3)
        return new EvalRelation(cod, this.t3)
    }
}

export class EIf implements Rule {
    id: Id
    name: string
    relation: Relation | null = null
    parentIds: (Id | null)[] = []
    t2: Term
    t3: Term
    constructor(id: Id, cond: EvalRelation, t2: Term, t3: Term) {
        this.id = id
        this.name = "E-If"
        this.relation = this.derive(cond)
        this.t2 = t2
        this.t3 = t3
    }
    derive(cond: EvalRelation): Relation {
        const codom = new TmIf(cond.t1, this.t2, this.t3)
        const dom   = new TmIf(cond.t2, this.t2, this.t3)
        return new EvalRelation(codom, dom)
    }
}