import { getTransitionSizes } from '@formkit/auto-animate'
export default function animationParams (el, action, oldCoords, newCoords): KeyframeEffect {
  let keyframes
  // supply a different set of keyframes for each action
  if (action === 'add') {
    if(!el.classList.contains('tab-splitter-open')) {
        keyframes = [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1.15)', opacity: 1, offset: 0.75 },
        { transform: 'scale(1)', opacity: 1 }
        ]
    } else {
        keyframes = []
    }
  }
  // keyframes can have as many "steps" as you prefer
  // and you can use the 'offset' key to tune the timing
  if (action === 'remove') {
    if(!el.classList.contains('tab-splitter-open')) {
        keyframes = [
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(1.15)', opacity: 1, offset: 0.75 },
            { transform: 'scale(1)', opacity: 0 }
        ]
    } else {
        keyframes = []
    }
  }
  if (action === 'remain') {
    if(!el.classList.contains('tab-splitter-open')) {
        // for items that remain, calculate the delta
        // from their old position to their new position
        const deltaX = oldCoords.left - newCoords.left
        const deltaY = oldCoords.top - newCoords.top
        // use the getTransitionSizes() helper function to
        // get the old and new widths of the elements
        const [widthFrom, widthTo, heightFrom, heightTo] = getTransitionSizes(el, oldCoords, newCoords)
        // set up our steps with our positioning keyframes
        const start = { transform: `translate(${deltaX}px, ${deltaY}px)` } as { transform: string; width?: string; height?: string };
        const mid = { transform: `translate(${deltaX * -0.15}px, ${deltaY * -0.15}px)`, offset: 0.75 } as { transform: string; width?: string; height?: string; offset: number };
        const end = { transform: `translate(0, 0)` } as { transform: string; width?: string; height?: string };
        // if the dimensions changed, animate them too.
        if (widthFrom !== widthTo) {
        start.width = `${widthFrom}px`
        mid.width = `${widthFrom >= widthTo ? widthTo / 0.75 : widthTo * 0.75}px`
        end.width = `${widthTo}px`
        }
        if (heightFrom !== heightTo) {
        start.height = `${heightFrom}px`
        mid.height = `${heightFrom >= heightTo ? heightTo / 0.75 : heightTo * 0.75}px`
        end.height = `${heightTo}px`
        }
        keyframes = [start, mid, end]
    } else {
        keyframes = []
    }
   
  }
  // return our KeyframeEffect() and pass
  // it the chosen keyframes.
  return new KeyframeEffect(el, keyframes, { duration: 150, easing: 'ease-in-out' })
}