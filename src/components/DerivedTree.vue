<template>
  <span>
    <p v-for="rule in items" :key="rule.id.value">
      ----------------- {{ rule.name }} 
      <br/>
      {{ rule.relation.toString() }}
    </p>
  </span>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import {TmIf, TmFalse, TmTrue} from './Term'
import * as rule from './Rule'
import * as relation from './Relation'

export default class DerivedTree extends Vue {
  items: rule.Rule[] = this.buildItem()
  buildItem() {
    console.log('build item')

    const idGen = new rule.IdGenerator()

    const rule1 = new rule.TextRule(idGen.newId(), 'EIfTrue', 0)
    rule1.setRelation(new relation.TextRelation('If true then false false'))

    const rule2 = new rule.TextRule(idGen.newId(), 'EIf', 1)
    rule2.setParentRule(0, rule1.id)
    rule2.setRelation(new relation.TextRelation('aaa'))

    const rule3 = new rule.TextRule(idGen.newId(), 'EIf', 1)
    rule3.setParentRule(0, rule2.id)
    rule3.setRelation(new relation.TextRelation('bbb'))

    const items = [rule1, rule2, rule3]
    return items
    // this.items.splice(0, 0, ...items)
    // console.log(rule3)

    // const s = new TmIf(TmTrue, TmFalse, TmFalse)
    // const t = new TmIf(s, TmTrue, TmTrue)
    // const u = new TmIf(TmFalse, TmTrue, TmTrue)

    // const rule1 = new rule.EIfTrue(TmFalse, TmFalse)
    // const rel1 = rule1.derive()
    // const rule2 = new rule.EIf(rel1, t, u)
    // const rel2 = rule2.derive()
    // const rule3 = new rule.EIf(rel2, TmTrue, TmFalse)
    // const rel3 = rule3.derive()

    // console.log(rel3)
  }

  x(): string {
    console.log("x")
    this.buildItem()
    return "x"
  }

  private async refresh() {
    console.log("refresh")
    this.buildItem()
  }
}
</script>