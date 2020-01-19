<template>
  <svg :width="width + 'rem'" :height="height + 'rem'" style="font-size: 20px">
    <svg v-for="item of items" :key="item.id.value">
      <line 
        :x1="item.view.x1()+'ch'" 
        :x2="item.view.x2()+'ch'"
        :y1="item.view.y+'rem'"
        :y2="item.view.y+'rem'"
        stroke="black">
      </line>
      <text 
            :x="item.view.x2()+'ch'" 
            :y="item.view.y+'rem'"
            dominant-baseline="central">
          {{ item.rule.name }}
      </text>
      <text 
        :x="item.view.cx()+'ch'" 
        :y="item.view.y+'rem'"
        text-anchor="middle"
        dominant-baseline="hanging">
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
  lineWidth: number
  nameWidth: number
  y: number
  static empty(id: ruleModel.Id): RuleView {
    return new RuleView(id, -1, -1 ,-1, -1)
    }
  constructor(id: ruleModel.Id, x: number, y: number, 
    lineWidth: number, nameWidth: number) {
    this.id = id
    this.x = x
    this.y = y
    this.lineWidth = lineWidth
    this.nameWidth = nameWidth
    
  }
  x1(): number {
    return this.x
  }
  x2(): number {
    return this.x + this.lineWidth
  }
  cx(): number {
    return this.x + this.lineWidth / 2
  }
  width(): number {
    return this.lineWidth + this.nameWidth
  }
  toString(): string {
    return `id: ${this.id.value}, {x: ${this.x}, y: ${this.y}`
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
  height: number = 20
  width: number = 50
  // ruleNameWidth: number = 5
  items: Item[] = []
  topItemId: ruleModel.Id | null = null

  getRule(id: ruleModel.Id): ruleModel.Rule {
    return this.items.find(v => v.id == id)!.rule
  }
  getView(id: ruleModel.Id): RuleView {
    return this.items.find(v => v.id.value == id.value)!.view
  }
  initItems() {
    console.log('refresh item')

    const idGen = new ruleModel.IdGenerator()

    const rule11 = new ruleModel.TextRule(idGen.newId(), 'EIfTrue', 0)
    rule11.setRelation(new relation.TextRelation('if true then false else false'))

    const rule12 = new ruleModel.TextRule(idGen.newId(), 'RULE-1-2', 0)
    rule12.setRelation(new relation.TextRelation('rel2'))

    const rule2 = new ruleModel.TextRule(idGen.newId(), 'EIf', 2)
    rule2.setParentRule(0, rule11.id)
    rule2.setParentRule(1, rule12.id)
    rule2.setRelation(new relation.TextRelation('aaa'))

    const rule3 = new ruleModel.TextRule(idGen.newId(), 'EIf', 1)
    rule3.setParentRule(0, rule2.id)
    rule3.setRelation(new relation.TextRelation('bbb'))

    const rules = [rule11, rule12, rule2, rule3]
    const items: Item[] = rules.map(v => {
      const item: Item = {
        id: v.id,
        rule: v,
        view: RuleView.empty(v.id)
      }
      return item
    })

    this.items.splice(0, this.items.length, ...items)
    this.topItemId = rule3.id
  }
  refreshViewsWidth(id: ruleModel.Id): number {
    const rule = this.getRule(id)
    const view = this.getView(id)

    let pWidth = 0
    for (let i = 0; i < rule.parentIds.length; i++) {
      const pId = rule.parentIds[i]
      if (pId) {
        this.refreshViewsWidth(pId)
        const pView = this.getView(pId)
        pWidth += pView.lineWidth
        if (i < rule.parentIds.length - 1 ) {
          pWidth += pView.nameWidth
        }
      }
    }

    let relationWidth = 3
    if(rule.relation) {
      relationWidth = rule.relation.toString().length
    }

    view.lineWidth = Math.max(pWidth, relationWidth)
    view.nameWidth = rule.name.length

    console.log(id.value, view.lineWidth, view.nameWidth)

    return view.width()
  }
  refreshViewsXY(id: ruleModel.Id, x: number, y: number): void {
    const rule = this.getRule(id)
    const view = this.getView(id)

    let xx = x
    for(let pId of rule.parentIds) {
      if(pId) {
        const pRule = this.getRule(pId)
        const pView = this.getView(pId)
        this.refreshViewsXY(pId, xx, y-1)
        xx += pView.width()
      }      
    }

    view.x = x
    view.y = y
  }
  refreshViews() {
    console.log('refresh views')
    if(!this.topItemId) return

    // const topItem = this.getRule(this.topItemId)

    // const topView = this.getView(this.topItemId)
    // topView.x = this.width / 2
    // topView.y = this.height - 5
    this.refreshViewsWidth(this.topItemId)
    this.refreshViewsXY(this.topItemId, 2, this.height - 5)
  }

  private async refresh() {
    console.log("refresh")
    // this.refreshItems()
    this.refreshViews()
  }

  created() {
    this.initItems()
    this.refresh()

    console.log(this.items)
  }
}
</script>