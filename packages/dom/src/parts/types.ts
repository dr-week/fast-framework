export interface Part {
  disconnect?: () => void;
}

export interface ChildPart extends Part {
  parentNode: Node;
  previousSibling: Node | null;
  nextSibling: Node | null;
  value: unknown;
  setValue: (value: unknown) => void;
}

export interface AttributePart extends Part {
  element: Element;
  attributeName: string;
  value: unknown;
  setValue: (value: unknown) => void;
}

export interface NativePartGroup {
  getParts?: () => Part[];
}
