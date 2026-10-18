# Shuffle

An app for mixing and matching little drawings


## To-Do

- [ ] Multiple colours
- [ ] Sliders to manipulate pen
- [ ] Export SVG
- [ ] Build canvas app as library
- [x] Handle click and touch inputs
- [x] Basic pen tool
- [x] Save paths to canvas using action list (to enable undo/redo)
- [x] Smooth pen tool (using perfect freehand)
- [x] Active tool switcher
- [x] Move and zoom tools
  - [x] Ensure coordinate spaces are defined correctly for tools based on zoom
  - [x] Handle two-finger and scroll move
  - [x] Handle two-finger and scroll zoom
  - [x] Later: Zooming to use cursor as base location
  - [ ] Later: Clamp canvas to bounds (weirdly tricky)
- [ ] Path selection tool with highlighting
  - [ ] Erasing?
  - [ ] For collision detection it might be possible to use an intersection observer with a fake hit-box if there's no obvious solution since https://developer.mozilla.org/en-US/docs/Web/API/SVGSVGElement/checkIntersection is not baseline
- [ ] Basic toolbox
  - [ ] Tools can render a button in the toolbox
  - [ ] Tools can render additional content in a secondary panel
  - [ ] Tools can directly render to the canvas (this should already be possible)
- [ ] Configurable color fill tool that fill selected paths
- [ ] Preload some initial content
- [ ] Swatches
  - [ ] Create a pattern from sketch
  - [ ] Use a pattern as fill
  - [ ] Create an SVG pattern/color from the camera
