import type { JSXNode} from "@builder.io/qwik";
import { QRL, jsx} from "@builder.io/qwik";
import { useVisibleTask$} from "@builder.io/qwik";
import { implicit$FirstArg} from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import * as d3 from 'd3';

export type Sel = {
  selector: string;
  attrs?: {};
  children?: Sel[];
  action?: 'select' | 'append';
};

export class Selection {
  constructor(public selector: string, public action: 'select' | 'append' = 'append') {}
  
  attrs: Map<string, number | string> = new Map();
  children: Selection[] = [];

  append(element: string): Selection {
    const child = new Selection(element);
    this.children.push(child);
    return child;
  }

  attr(key: string, value: number | string): Selection {
    this.attrs?.set(key, value);
    return this;
  }

  static select(selector: string): Selection {
    return new Selection(selector, 'select');
  }
}

export const toJsx = (sel: Sel): JSXNode<string> => {
  const attributes = { ...sel.attrs, children: sel.children ? sel.children.map(child => toJsx(child)) : []};
  return jsx(sel.selector, {...attributes});
}

export const toD3 = (sel: Sel, parent?: any): void => {
  switch (sel.action) {
    case 'select': {
      const d3Selection = parent ? parent.select(sel.selector) : d3.select(sel.selector);
      if (sel.attrs) {
        Object.entries(sel.attrs).forEach(attr => d3Selection.attr(attr[0], attr[1]));
      }
      sel.children?.forEach(child => toD3(child, d3Selection));
      return d3Selection;
    }
    case 'append': {
      const d3Selection = parent.append(sel.selector);
      if (sel.attrs) {
        Object.entries(sel.attrs).forEach(attr => d3Selection.attr(attr[0], attr[1]));
      }
      sel.children?.forEach(child => toD3(child, d3Selection));
      return d3Selection;
    }
  }
};

const serialize = (selection: Selection): Sel => {
  const {selector, attrs, children, action} = selection;
  return {
    selector, 
    action,
    attrs: attrs ? Object.fromEntries(attrs.entries()):undefined, 
    children: children ? children.map(child => serialize(child)) : []
  };
};

// function qd3Qrl(fn: QRL<(qd3: any) => void>): void {
//   let qd3: {select: (selector: string) => void};
//   if (document) {
//     useVisibleTask$
//   }
//   fn(null);
// }

// const d3$ = implicit$FirstArg(qd3Qrl);

export const Qd3 = component$(() => {
  // const svg: Sel = {
  //   selector: 'svg', 
  //   action: 'select',
  //   attrs: {'width': 100, 'height': 100}, 
  //   children: [{selector: 'rect', action: 'append', attrs: {'width': 10, 'height': 10, 'stroke': 'red'}}]
  // };
  const svgSrc = Selection.select('svg');
  svgSrc.append('rect').attr('width', 10).attr('height', 10).attr('stroke', 'red');

  const svg = serialize(svgSrc);

  useVisibleTask$(() => {
    toD3(svg);
  });

  // return <>
  // {toJsx(svg)}
  //   {/* {svg.toJsx()} */}
  // </>;
  return <svg width={100} height={100}>
  </svg>;
});