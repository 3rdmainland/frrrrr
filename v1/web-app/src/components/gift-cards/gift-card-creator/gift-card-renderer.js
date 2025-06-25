export default {

  props: {
    card: { type: Object /*GiftCard*/, required: true },
    width: { type: Number, default: 500 },
    height: { type: Number, default: 312 },
    textGravity: { type: String, default: 'center center' },
    textColor: { type: String, default: 'white' },
  },

  data() {
    return {
      ctx: null,
      cardDesignImage: null,
      cardDesignLoading: false,
    }
  },

  computed: {
    recipinetName() {
      return this.card.cards.length == 1
        ? this.card.cards[0].toName
        : ' '
    }
  },

  watch: {

    /**
     * This watcher needs to fire when the renderer component is first created, and when
     * `srcImageUrl` changes to ensure the `cardDesignImage` is available to be drawn to the canvas.
     */
    'card.srcImageUrl': {
      immediate: true,
      handler() {
        if(!this.card.srcImageUrl) return
        this.cardDesignImage = null // clear cached image
        let img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
          this.cardDesignImage = img
          this.cardDesignLoading = false
          this._updateCanvas()
        }
        this.cardDesignLoading = true
        img.src = `${this.card.srcImageUrl}?cors-issue-cache-buster=${Math.random()*9999999}`
      }
    },

    'card.price': '_updateCanvas',
    'recipinetName': '_updateCanvas',
    'card.message': '_updateCanvas',
  },

  render(h) {
    const children = []

    children.push(
      h('canvas', {
        ref: 'canvas',
        attrs: { width: this.width, height: this.height },
      })
    )

    this.cardDesignLoading && children.push(
      h('n-progress-circular', { props: { indeterminate: true, primary:true }})
    )

    return h('div', {'class': 'gift-card-renderer'}, children)
  },

  mounted() {
    let canvas = this.$refs.canvas
    this.ctx = canvas.getContext('2d')
    this._updateCanvas()
  },

  methods: {
    _updateCanvas() {
      if(!this.ctx || this.cardDesignLoading) return
      this.ctx.clearRect(0, 0, this.width, this.height)

      this._drawBackground(this.ctx)
      this._drawName(this.ctx)
      this._drawPrice(this.ctx)
      this._drawMessage(this.ctx)
    },

    _drawBackground(ctx) {
      ctx.save()
      if(this.card.srcImageUrl) {
        if(this.cardDesignImage) { // if image hasn't loaded, don't try to draw it yet
          ctx.drawImage(this.cardDesignImage, 0, 0, this.width, this.height)
        }
      }
      else { // no background image selected, draw placeholder
        ctx.fillStyle = '#efefef'
        ctx.fillRect(0, 0, this.width, this.height)
      }
      ctx.restore()
    },


    _drawPrice(ctx) {
      let fontSize = 28
      let padding = 20
      let price = this.card.price
        ? this.$t('giftCard.creation.cardPreview.price', {amount: this.$options.filters.money(this.card.price, 'moneyRounded')})
        : this.$t('giftCard.creation.cardPreview.placeholders.price')
      ctx.fillStyle = this.textColor
      ctx.font = `${fontSize}px "Noto Sans"`
      ctx.fillText(price, this.width - ctx.measureText(price).width - padding, fontSize + padding - fontSize * 0.3)
    },

    _drawName(ctx) {
      let fontSize = 28
      let padding = 20
      let name = this.recipinetName || this.$t('giftCard.creation.cardPreview.placeholders.name')
      ctx.fillStyle = this.textColor
      ctx.font = `${fontSize}px "Noto Sans"`
      ctx.fillText(name, padding, fontSize + padding - fontSize * 0.3)
    },

    _drawMessage(ctx) {
      ctx.save()
      let message = this.card.message || this.$t('giftCard.creation.cardPreview.placeholders.message')
      let fontSize;

           if(message.length < 6)  fontSize = 110
      else if(message.length < 11) fontSize = 75
      else if(message.length < 21) fontSize = 70
      else if(message.length < 36) fontSize = 60
      else                         fontSize = 45

      ctx.fillStyle = this.textColor
      ctx.font = `${fontSize}px Nandos Hand`
      ctx.textBaseline = 'top';

      let lineMaxWidth = this.width * 0.65
      let lines = []
      let words = message.split(' ')

      for (let i = 0; i < words.length; i++) {
        let test = words[i]
        let metrics = ctx.measureText(test);

        // If single word is too long to fit on a line, determine how much of the word will fit
        while (metrics.width > lineMaxWidth) {
          test = test.substring(0, test.length - 1);
          metrics = ctx.measureText(test + '-');
        }

        // Rewrite the word as 2 words (hyphenated)
        if (words[i] != test) {
          words.splice(i + 1, 0,  words[i].substr(test.length))
          words[i] = test + '-';
        }

        let word = words[i]
        let nextLength = lines[lines.length - 1] + ' ' + word
        if(lines.length != 0 && ctx.measureText(nextLength).width < lineMaxWidth) // add to existing line
          lines[lines.length - 1] += ' ' + word
        else // start a new line
          lines.push(word)
      }

      let lineHeight = fontSize // ?? Seems about right
      let textTotalHeight = lines.length * lineHeight
      let paddingTop = 10 // offset for card amount and price text

      ctx.rotate(-3 * Math.PI / 180);
      
      lines.forEach((line, idx) => {
        let x = (this.width - ctx.measureText(line).width) * 0.5
        let y = ((this.height - textTotalHeight) * 0.5) + (idx * lineHeight) + paddingTop
        ctx.fillText(line, x, y)
      })

      ctx.restore()
      
    },

    getImage() {
      return this.ctx.canvas.toDataURL('image/jpeg', 0.8)
    },
  },

}