<template>
    <svg>
        <line :x1="x1" :x2="x2()" :y1="y" :y2="y"></line>
        <text :x="x2()" :y="y"> rule.vue </text>
    </svg>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import {TmIf, TmFalse, TmTrue} from './Term'
import * as rule from './Rule'
import * as relation from './Relation'

@Component
export default class Rule extends Vue {
    item: rule.Rule | null = null
    x1: number = 0
    y: number = 0
    width: number = 10
    x2(): number {
        return this.x1 + this.width
    }
}
</script>
