declare namespace JSX {
  interface IntrinsicElements {
    'iconify-icon': {
      icon: string
      width?: string | number
      height?: string | number
      strokeWidth?: string | number
      class?: string
      style?: React.CSSProperties
    }
  }
}
