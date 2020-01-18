<template>
  <svg>
    <svg v-for="item of items" :key="item.id.value">
      <line 
        :x1="item.view.x1()+'rem'" 
        :x2="item.view.x2()+'rem'"
        :y1="item.view.y+'rem'"
        :y2="item.view.y+'rem'"
        stroke="black">
      </line>
      <text 
        :x="item.view.x2()+'rem'" 
        :y="item.view.y+'rem'">
        {{ item.rule.name }}
      </text>
      <text 
        :x="item.view.x+'rem'" 
        :y="item.view.y+1+'rem'">
        {{ item.rule.relation }}
      </text>
    </svg>
  </svg>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import {TmIf, TmFalse, TmTrue} from './Term'
import * as ruleModel from './Rule'
import * as relation from './Relation'
import rule from './Rule.vue'

class RuleView {
  id: ruleModel.Id
  x: number
  width: number
  y: number
  static empty(id: ruleModel.Id): RuleView {
    return new RuleView(id, -1, -1 ,-1)
    }
  constructor(id: ruleModel.Id, x: number, width: number, y: number) {
    this.id = id
    this.x = x
    this.width = width
    this.y = y
  }
  x1(): number {
    return this.x - this.width / 2
  }
  x2(): number {
    return this.x + this.width / 2
  }
  toString(): string {
    return `id: ${this.id.value}, {x: ${this.x}, y: ${this.y}, w: ${this.width}}`
  }
}
interface Item {
  id: ruleModel.Id
  rule: ruleModel.Rule
  view: RuleView
}

@Component({
  components: {
    rule
  },
})
export default class DerivedTree extends Vue {
  heightRem: number = 15
  widthRem: number = 20
  items: Item[] = []
  topItemId: ruleModel.Id | null = null

  getRule(id: ruleModel.Id): ruleModel.Rule {
    return this.items.find(v => v.id == id)!.rule
  }
  getView(id: ruleModel.Id): RuleView {
    return this.items.find(v => v.id.value == id.value)!.view
  }
  buildRules() {
    console.log('refresh item')

    const idGen = new ruleModel.IdGenerator()

    const rule1 = new ruleModel.TextRule(idGen.newId(), 'EIfTrue', 0)
    rule1.setRelation(new relation.TextRelation('If true then false false'))

    const rule2 = new ruleModel.TextRule(idGen.newId(), 'EIf', 1)
    rule2.setParentRule(0, rule1.id)
    rule2.setRelation(new relation.TextRelation('aaa'))

    const rule3 = new ruleModel.TextRule(idGen.newId(), 'EIf', 1)
    rule3.setParentRule(0, rule2.id)
    rule3.setRelation(new relation.TextRelation('bbb'))

    const rules = [rule1, rule2, rule3]
    return rules
  }
  refreshRuleView(id: ruleModel.Id): void {
    console.log('refresh view', id.value)
    if(!this.topItemId) return
    const rule = this.getRule(id)
    const view = this.getView(id)

    const ws: number[] = []
    for(let parentId of rule.parentIds) {
      const parentRule = this.getRule(parentId!)
      const w = parentRule.relation!.toString().length
      ws.push(w)
    }

    const widthFromParent = ws.reduceRight((x, y) => x+y, 0)
    const widthFromRelation = rule.relation!.toString().length
    view.width = Math.max(widthFromParent, widthFromRelation)

    let x1 = view.x - view.width / 2
    for(let i = 0; i < rule.parentIds.length; i++) {
      const parentId = rule.parentIds[i]!
      const w = ws[i]
      const parentView = this.getView(parentId)

      parentView.x = x1 + w / 2
      parentView.y = view.y - 1

      console.log(id.value, parentId.value)

      this.refreshRuleView(parentId)

      x1 += w
    }
  }
  refreshViews() {
    console.log('refresh views')
    if(!this.topItemId) return

    const topItem = this.getRule(this.topItemId)

    const topView = this.getView(this.topItemId)
    topView.x = 5
    topView.y = 5
    this.refreshRuleView(topView.id)
  }

  private async refresh() {
    console.log("refresh")
    // this.refreshItems()
    this.refreshViews()
  }

  created() {
    const rules = this.buildRules()
    const items: Item[] = rules.map(v => {
      const item: Item = {
        id: v.id,
        rule: v,
        view: RuleView.empty(v.id)
      }
      return item
    })

    this.items.splice(0, this.items.length, ...items)
    console.log('this.items.length', this.items.length)
    this.topItemId = this.items[2].id
    this.refresh()
  }
}
</script>