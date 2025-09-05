/**
 * vue-component-type-helpers
 * Copy from https://github.com/vuejs/language-tools/tree/master/packages/component-type-helpers
 */

import type { StringOrVNode } from '@movk/core'
import type { Component, DefineComponent, FunctionalComponent, VNode } from 'vue'

export type IsComponent = StringOrVNode | Component | DefineComponent | FunctionalComponent | ((...args: any[]) => VNode)

export type ComponentType<T> = T extends new(...args: any) => object ? 1
  : T extends (...args: any) => any ? 2
    : 0

export type ComponentProps<T> = T extends new(...args: any) => { $props: infer P } ? NonNullable<P>
  : T extends (props: infer P, ...args: any) => any ? P
    : object

export type ComponentSlots<T> = T extends new(...args: any) => { $slots: infer S } ? NonNullable<S>
  : T extends new(...args: any) => { $scopedSlots: infer S } ? NonNullable<S> // Vue 2
    : T extends (props: any, ctx: { slots: infer S, attrs: any, emit: any }, ...args: any) => any ? NonNullable<S>
      : object

export type ComponentAttrs<T> = T extends new(...args: any) => { $attrs: infer A } ? NonNullable<A>
  : T extends (props: any, ctx: { slots: any, attrs: infer A, emit: any }, ...args: any) => any ? NonNullable<A>
    : object

export type ComponentEmit<T> = T extends new(...args: any) => { $emit: infer E } ? NonNullable<E>
  : T extends (props: any, ctx: { slots: any, attrs: any, emit: infer E }, ...args: any) => any ? NonNullable<E>
    : object

export type ComponentExposed<T> = T extends new(...args: any) => infer E ? E
  : T extends (props: any, ctx: any, expose: (exposed: infer E) => any, ...args: any) => any ? NonNullable<E>
    : object
