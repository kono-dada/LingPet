// 窗口相关类型定义
export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface DragState {
  isDragging: boolean;
  startPosition?: WindowPosition;
}
