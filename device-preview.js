import { LitElement, html } from 'lit-element';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * `editor`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/device-preview.html
 */
class DevicePreview extends LitElement {
  render() {
    return html`
      <style>
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #device {
          border-width: 9px;
          border-style: solid;
          border-color: #1a1a1a;
          border-radius: 40px;
          // overflow: hidden;
          margin: auto;
          display: flex;
          flex-direction: column;
        }

        #device ::slotted(*) {
          width: 100%;
          height: 100%;
        }
      </style>

      <div id="wrapper" style="zoom:${this.zoom}">

        <div
          id="device"
          style="width:${this.deviceSize.width};height:${this.deviceSize.height}"
          @transitionend="${this._handleTransitionEnd}">
          <slot></slot>
        </div>

      </div>

    `;
  }

  static get properties() {
    return {
      device: {
        type: String,
      },
      devices: {
        type: Object,
      },
      orientation: {
        type: String,
      },
      zoom: {
        type: String
      }
    };
  }

  constructor() {
    super();
    this.device = 'iphone6';
    this.devices = {
      'iphone5': {
        width: 320,
        height: 568,
        orientations: ['portrait', 'landscape']
      },
      'iphone6': {
        width: 375,
        height: 667,
        orientations: ['portrait', 'landscape']
      },
      'iphoneX': {
        width: 375,
        height: 812,
        orientations: ['portrait', 'landscape']
      },
      'oneplus6T': {
        width: 360,
        height: 760,
        orientations: ['portrait', 'landscape']
      },
      'galaxyS7': {
        width: 480,
        height: 853,
        orientations: ['portrait', 'landscape']
       },
      'galaxyS8': {
        width: 480,
        height: 987,
        orientations: ['portrait', 'landscape']
       },
      'galaxyA5': {
        width: 360,
        height: 640,
        orientations: ['portrait', 'landscape']
       },
      'ipad': {
        width: 768,
        height: 1024,
        orientations: ['portrait', 'landscape']
       },
      'macbook': {
        width: 800,
        height: 1280,
        orientations: ['landscape']
       }
    };
    this.orientation = 'portrait';
    this.zoom = 1;
    this._initResize();
  }

  updated(props) {
    super.updated();
    if(props.has('device') || props.has('orientation')) this._setZoom();
    if(props.has('device')) this.dispatchEvent(new CustomEvent('device-changed', {detail: {value: this.device}}))
    if(props.has('orientation')) this.dispatchEvent(new CustomEvent('orientation-changed', {detail: {value: this.orientation}}))
    if(props.has('zoom')) this.dispatchEvent(new CustomEvent('zoom-changed', {detail: {value: this.zoom}}))
  }

  _handleTransitionEnd(evt) {
    this._setZoom();
  }

  get deviceSize() {
    var device = this.devices[this.device];
    this.orientation = (device.orientations.indexOf(this.orientation) === -1) ? device.orientations[0] : this.orientation;
    var width = (this.orientation === 'landscape') ? device.height : device.width;
    var height = (this.orientation === 'landscape') ? device.width : device.height;
    return {width: width + 'px', height: height + 'px'};
  }

  _initResize() {
    const ro = new ResizeObserver(this._handleResize.bind(this));
    ro.observe(this);
  }

  _handleResize(entries, observer) {
    window.clearTimeout(this._resizeDebouncer);
    this._resizeDebouncer = window.setTimeout(() => {
      for (const entry of entries) {
        const {left, top, width, height} = entry.contentRect;
        window.requestAnimationFrame(this._setZoom.bind(this));
      }
    }, 40)
  }

  _setZoom() {
    var maxWidth = this.offsetWidth;
    var currentWidth = this.shadowRoot.querySelector('#device').offsetWidth;
    var zoomRatioX = parseFloat(maxWidth / currentWidth);

    var maxHeight = this.offsetHeight;
    var currentHeight = this.shadowRoot.querySelector('#device').offsetHeight;
    var zoomRatioY = parseFloat(maxHeight / currentHeight);

    var zoomRatio = Math.min(zoomRatioX, zoomRatioY);

    if(zoomRatio > 1) zoomRatio = 1;
    this.zoom = zoomRatio;
  }

}

window.customElements.define('device-preview', DevicePreview);
