/** Every concrete kind of shape the factory knows how to build. */
export enum ShapeType {
  Triangle = "triangle",
  Square = "square",
  Pentagon = "pentagon",
  Hexagon = "hexagon",
  Circle = "circle",
  Ellipse = "ellipse",
  Star = "star",
  Irregular = "irregular",
}

/** The random pool for auto-generated shapes (requirement 2h). */
export const RANDOM_SHAPE_TYPES: readonly ShapeType[] = [
  ShapeType.Triangle,
  ShapeType.Square,
  ShapeType.Pentagon,
  ShapeType.Hexagon,
  ShapeType.Circle,
  ShapeType.Ellipse,
  ShapeType.Star,
];
