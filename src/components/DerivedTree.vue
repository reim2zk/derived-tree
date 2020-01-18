<template>
  <svg>
    <text v-for="view in views" :key="view.id.value" 
      :x="view.x1()+'rem'" :y="view.y+'rem'">
      {{ `${view.id.value} ${getView(view.id).name}` }}
    </text>
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

@Component({
  components: {
    rule
  },
})
export default class DerivedTree extends Vue {
  heightRem: number = 15
  widthRem: number = 20
  items: ruleModel.Rule[] = []
  topItemId: ruleModel.Id | null = null
  views: RuleView[] = []

  getRule(id: ruleModel.Id): ruleModel.Rule {
    return this.items.find(v => v.id == id)!
  }
  getView(id: ruleModel.Id): RuleView {
    return this.views.find(v => v.id.value == id.value)!
  }
  buildItems() {
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

    const items = [rule1, rule2, rule3]
    return items
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

    const views = this.items.map( v => RuleView.empty(v.id) )
    this.views.splice(0, this.views.length, ...views)

    const topView = this.getView(this.topItemId)
    topView.x = 5
    topView.y = 5
    this.refreshRuleView(topView.id)
  }

  private async refresh() {
    console.log("refresh")
    // this.refreshItems()
    this.refreshViews()
    console.log(this.views.map(v => v.toString()))
    console.log(this.items.map(v => v.parentIds.map(u => `${v.id.value}, ${u!.value}`)))
  }

  created() {
    const items = this.buildItems()
    this.items.splice(0, this.items.length, ...items)
    this.topItemId = this.items[2].id
    this.refresh()
  }
}
</script>