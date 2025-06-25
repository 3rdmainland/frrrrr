<template>
  <section :class="classes">

    <n-button v-if="!hideCloseBtn" @click.native="$emit('done')" floating fixed top right flat class="close-btn" style="z-index:2;">
      <n-icon>close</n-icon>
    </n-button>

    <!-- Definitions for the half-and-half flavour curve (used as clipping mask) -->
    <!-- Declared separately so we don't regenerate during background swap transitions -->
    <svg v-if="halfAndHalfMode" class="new-layer">
      <defs>
        <clipPath id="half-and-half-shape-left">
          <path :d="flavourShapeLeft" />
        </clipPath>
        <clipPath id="half-and-half-shape-right">
          <path :d="flavourShapeRight" />
        </clipPath>
      </defs>
    </svg>

    <transition v-if="pageIntroAnimationComplete" name="peri-ometer-bg-transition" mode="in-out" appear>
      <div class="peri-ometer-bg new-layer" ref="periOmeterBgLayer" :key="`${flavour1}-${flavour2}-${halfAndHalfMode}`"> <!-- We compute a key to make sure any changes to flavour's or mode creates a new element, which triggers the transition -->
        <svg  :viewBox="`0 0 ${viewport.width} ${viewport.height}`" class="new-layer">
          <template v-if="halfAndHalfMode">

            <!-- Half-&-Half Flavour BG Rects -->
            <rect clip-path="url(#half-and-half-shape-left)" class="peri-ometer-bg-layer-overdraw" :class="flavour1FillClass" x="0" y="0" width="100%" height="100%" fill="none" />
            <rect clip-path="url(#half-and-half-shape-right)" class="peri-ometer-bg-layer-overdraw" :class="flavour2FillClass" x="0" y="0" width="100%" height="100%" fill="none" />

            <!-- Curve Debug helpers -->
            <template v-if="debugSVG">
              <circle :cx="viewport.width" cy="0" r="5" fill="blue"/>

              <template v-for="(bezier, bidx) in curveData">
                <!-- Curve -->
                <template v-if="bidx == 0">
                  <path :d="`M${viewport.width},0 C${bezier.map(([x, y]) => `${x} ${y}`).join(', ')}`" style="stroke:blue;stroke-width:2" fill="none" />
                </template>
                <template v-else>
                  <path :d="`M${curveData[bidx-1][2][0]},${curveData[bidx-1][2][1]} C${bezier.map(([x, y]) => `${x} ${y}`).join(', ')}`" :style="`stroke:${bidx % 2 ? 'black' : 'blue'};stroke-width:2`" fill="none" />
                </template>

                <template v-for="(point, pidx) in bezier">
                  <!-- Circle -->
                  <circle :cx="point[0]" :cy="point[1]" :r="pidx == 2 ? 7 : 4" :fill="pidx == 2 ? 'blue' : 'red'"/>
                  <!-- Line -->
                  <template v-if="bidx == 0 && pidx == 0">
                    <line :x1="point[0]" :y1="point[1]" :x2="viewport.width" :y2="0" style="stroke:rgba(0,0,0,0.5);stroke-width:1" />
                  </template>
                  <template v-else-if="pidx == 0">
                    <line :x1="point[0]" :y1="point[1]" :x2="curveData[bidx-1][2][0]" :y2="curveData[bidx-1][2][1]" style="stroke:rgba(0,0,0,0.5);stroke-width:1" />
                  </template>
                  <template v-else-if="pidx == 2">
                    <line :x1="point[0]" :y1="point[1]" :x2="curveData[bidx][pidx-1][0]" :y2="curveData[bidx][pidx-1][1]" style="stroke:rgba(0,0,0,0.5);stroke-width:1" />
                  </template>
                </template>
              </template>
            </template>
            
          </template>
          <!-- Single Flavour BG Rect -->
          <rect v-else class="peri-ometer-bg-layer-overdraw" :class="flavour1FillClass" x="0" y="0" width="100%" height="100%" fill="none" />
        </svg>
      </div>
    </transition>

    <div v-if="halfAndHalfMode" class="new-layer instructions">
      <div v-if="!flavour1" class="instructions__falvour-1">
        <h3 class="instructions__label" v-html="$t('product.configuration.halfAndHalf.first')"></h3>
        <img class="instructions__arrow" src="../../../../assets/img/flavour-chooser-instruction-arrow.svg">
      </div>
      <div v-else-if="!flavour2" class="instructions__falvour-2">
        <img class="instructions__arrow" src="../../../../assets/img/flavour-chooser-instruction-arrow.svg">
        <h3 class="instructions__label" v-html="$t('product.configuration.halfAndHalf.second')"></h3>
      </div>
    </div>

    <div class="peri-ometer__wrapper mb-5">
      <n-ordering-peri-ometer ref="periOmeter" :flavour1.sync="flavour1" :flavour2.sync="flavour2" :selectable-flavours="availableFlavourNames" :half-and-half="halfAndHalfMode" :style="halfAndHalfMode && debugSVG ? 'opacity: 0.4' : null"/>     
    </div>

    <div class="flexbox justify-space-between align-center mb-2">
      <!-- Half and Half Flavour Btn -->
      <n-button v-if="productHasHalfAndHalfOption && halfAndHalfMode == false" @click.native.stop="halfAndHalfMode = true" floating class="half-and-half-btn lumo-pink white--text">{{ $t('product.configuration.flavour.switchToHalfAndHalf') }}</n-button>
      <!-- Single Flavour Btn -->
      <n-button v-else-if="productHasHalfAndHalfOption" @click.native.stop="halfAndHalfMode = false" floating class="single-flavour-btn yellow black--text" :key="'flavour-mode'">{{ $t('product.configuration.flavour.switchToSingle') }}</n-button>
      <!-- No Sauce Btn -->
      <n-button v-if="productHasNoSauceOption && !halfAndHalfMode" @click.native.stop="flavour1 = 'no-sauce'" flat small class="no-sauce-btn" :key="'no-sauce'">{{ $t('product.configuration.flavour.noSauce') }}</n-button>
      <!-- Done Btn -->
      <n-button v-if="!hideDone" @click.native.stop="$emit('done')" :disabled="!selectionIsValid" small class="done-btn">{{ $t('product.configuration.done') }}</n-button>
    </div>

     
  </section>       
</template>


<script>export {default} from './product-configurator-flavour-selection.js';</script>