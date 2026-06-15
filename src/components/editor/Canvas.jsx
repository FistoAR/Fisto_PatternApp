import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import cursorIcon from "../../assets/images/Icons/cursor.webp";
import handIcon from "../../assets/images/Icons/hand.webp";
import flipHorizontalIcon from "../../assets/images/Icons/flip-horizontal.webp";
import flipVerticalIcon from "../../assets/images/Icons/flip-verticle.webp";
import frontIcon from "../../assets/images/Icons/front.webp";
import lockIcon from "../../assets/images/Icons/lock.webp";
import sendIcon from "../../assets/images/Icons/send.webp";
import transparentIcon from "../../assets/images/Icons/transparent.webp";
import erraserIcon from "../../assets/images/Editor 2/Icons/erraser.webp";

const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = 2048;
const DEFAULT_TEXTURE_SIZE = { width: TEXTURE_WIDTH, height: TEXTURE_HEIGHT };
const WIDE_TEXTURE_DISPLAY_SCALE = 0.7;

// Handle types for transform controls
const HANDLE = {
  NONE: 0,
  MOVE: 1,
  ROTATE: 2,
  // Corner resize handles
  TL: 3,
  TR: 4,
  BR: 5,
  BL: 6,
  // Edge midpoint handles
  T: 7,
  R: 8,
  B: 9,
  L: 10,
};

class DraggableImage {
  constructor(img, textureSize) {
    this.img = img;
    this.width = textureSize.width * 0.4;
    this.height = (this.width / img.width) * img.height;

    // Center initially
    this.x = (textureSize.width - this.width) / 2;
    this.y = (textureSize.height - this.height) / 2;

    this.rotation = 0;
    this.opacity = 1;
    this.flipX = false;
    this.flipY = false;
    this.locked = false;
    this.selectedFaceIds = [];
    this.fitType = null;
    this.filteredCanvas = null;
    this.filteredCtx = null;
  }

  clone(offset = 32) {
    const copy = Object.create(DraggableImage.prototype);
    copy.img = this.img;
    copy.width = this.width;
    copy.height = this.height;
    copy.x = this.x + offset;
    copy.y = this.y + offset;
    copy.rotation = this.rotation;
    copy.opacity = this.opacity;
    copy.flipX = this.flipX;
    copy.flipY = this.flipY;
    copy.locked = this.locked;
    copy.selectedFaceIds = [...(this.selectedFaceIds || [])];
    copy.fitType = this.fitType;
    copy.erasedColors = JSON.parse(JSON.stringify(this.erasedColors || []));
    if (this.filteredCanvas) {
      copy.filteredCanvas = document.createElement("canvas");
      copy.filteredCanvas.width = this.filteredCanvas.width;
      copy.filteredCanvas.height = this.filteredCanvas.height;
      copy.filteredCtx = copy.filteredCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      copy.filteredCtx.drawImage(this.filteredCanvas, 0, 0);
    }
    return copy;
  }

  removeColor(r, g, b, tolerance = 30) {
    if (!this.erasedColors) this.erasedColors = [];
    this.erasedColors.push({ r, g, b, tolerance });
    this.applyEraser();
  }

  applyEraser() {
    if (!this.filteredCanvas) {
      this.filteredCanvas = document.createElement("canvas");
      this.filteredCanvas.width = this.img.width;
      this.filteredCanvas.height = this.img.height;
      this.filteredCtx = this.filteredCanvas.getContext("2d", {
        willReadFrequently: true,
      });
    }

    this.filteredCtx.clearRect(
      0,
      0,
      this.filteredCanvas.width,
      this.filteredCanvas.height,
    );
    this.filteredCtx.drawImage(this.img, 0, 0);

    if (!this.erasedColors || this.erasedColors.length === 0) return;

    const imgData = this.filteredCtx.getImageData(
      0,
      0,
      this.filteredCanvas.width,
      this.filteredCanvas.height,
    );
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;

      const pr = data[i];
      const pg = data[i + 1];
      const pb = data[i + 2];

      for (const color of this.erasedColors) {
        const dist = Math.sqrt(
          (pr - color.r) * (pr - color.r) +
            (pg - color.g) * (pg - color.g) +
            (pb - color.b) * (pb - color.b),
        );
        if (dist <= color.tolerance) {
          data[i + 3] = 0;
          break;
        }
      }
    }

    this.filteredCtx.putImageData(imgData, 0, 0);
  }

  // Get the center in texture-space
  getCenterTex() {
    return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
  }

  // Convert a point from canvas-space to the image's local rotated coordinate system
  _toLocal(mx, my, scale) {
    const cx = (this.x + this.width / 2) / scale;
    const cy = (this.y + this.height / 2) / scale;
    const dx = mx - cx;
    const dy = my - cy;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    return {
      lx: dx * cos - dy * sin,
      ly: dx * sin + dy * cos,
    };
  }

  draw(ctx, scale, uvComponents = []) {
    ctx.save();

    // Clip to the selected faces if any to show image contained inside selected frame/face
    if (
      this.selectedFaceIds &&
      this.selectedFaceIds.length > 0 &&
      uvComponents &&
      uvComponents.length > 0
    ) {
      ctx.beginPath();
      let hasPath = false;
      this.selectedFaceIds.forEach((fId) => {
        const comp = uvComponents.find((c) => c.id === fId);
        if (comp && comp.path && comp.path.length > 0) {
          ctx.moveTo(
            comp.path[0].u * ctx.canvas.width,
            comp.path[0].v * ctx.canvas.height,
          );
          for (let i = 1; i < comp.path.length; i++) {
            ctx.lineTo(
              comp.path[i].u * ctx.canvas.width,
              comp.path[i].v * ctx.canvas.height,
            );
          }
          hasPath = true;
        }
      });
      if (hasPath) {
        ctx.closePath();
        ctx.clip();
      }
    }

    ctx.globalAlpha = this.opacity;

    const scaledX = this.x / scale;
    const scaledY = this.y / scale;
    const scaledW = this.width / scale;
    const scaledH = this.height / scale;

    ctx.translate(scaledX + scaledW / 2, scaledY + scaledH / 2);
    ctx.rotate(this.rotation);
    ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);

    const source = this.filteredCanvas || this.img;
    ctx.drawImage(source, -scaledW / 2, -scaledH / 2, scaledW, scaledH);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawControls(ctx, scale) {
    const scaledW = this.width / scale;
    const scaledH = this.height / scale;
    const cx = (this.x + this.width / 2) / scale;
    const cy = (this.y + this.height / 2) / scale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    // --- Bounding box ---
    ctx.strokeStyle = "#7c5cfc";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.strokeRect(-scaledW / 2, -scaledH / 2, scaledW, scaledH);

    // --- Corner handles (circles) ---
    const cornerRadius = 5;
    const corners = [
      [-scaledW / 2, -scaledH / 2],
      [scaledW / 2, -scaledH / 2],
      [scaledW / 2, scaledH / 2],
      [-scaledW / 2, scaledH / 2],
    ];

    corners.forEach(([hx, hy]) => {
      ctx.beginPath();
      ctx.arc(hx, hy, cornerRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#7c5cfc";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // --- Edge midpoint handles (small squares) ---
    const midSize = 4;
    const midpoints = [
      [0, -scaledH / 2], // top
      [scaledW / 2, 0], // right
      [0, scaledH / 2], // bottom
      [-scaledW / 2, 0], // left
    ];

    midpoints.forEach(([hx, hy]) => {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#7c5cfc";
      ctx.lineWidth = 2;
      ctx.fillRect(hx - midSize, hy - midSize, midSize * 2, midSize * 2);
      ctx.strokeRect(hx - midSize, hy - midSize, midSize * 2, midSize * 2);
    });

    // --- Rotation handle (top center, outside the box) ---
    const rotHandleOffset = 28;
    const rotHandleY = -(scaledH / 2 + rotHandleOffset);

    // Connecting line
    ctx.beginPath();
    ctx.moveTo(0, -scaledH / 2);
    ctx.lineTo(0, rotHandleY + 10);
    ctx.strokeStyle = "#7c5cfc";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rotation icon circle background
    ctx.beginPath();
    ctx.arc(0, rotHandleY, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#7c5cfc";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw rotation arrow icon
    ctx.save();
    ctx.translate(0, rotHandleY);
    ctx.strokeStyle = "#7c5cfc";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Circular arrow
    ctx.beginPath();
    ctx.arc(0, 0, 6, -Math.PI * 0.8, Math.PI * 0.5, false);
    ctx.stroke();

    // Arrow head
    const aex = 6 * Math.cos(Math.PI * 0.5);
    const aey = 6 * Math.sin(Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(aex - 3, aey - 2);
    ctx.lineTo(aex, aey);
    ctx.lineTo(aex + 3, aey - 2);
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }

  contains(mx, my, scale) {
    const { lx, ly } = this._toLocal(mx, my, scale);
    const hw = this.width / scale / 2;
    const hh = this.height / scale / 2;
    return lx >= -hw && lx <= hw && ly >= -hh && ly <= hh;
  }

  // Returns the HANDLE type at the given canvas point
  hitTest(mx, my, scale) {
    if (this.locked) return HANDLE.NONE;
    const { lx, ly } = this._toLocal(mx, my, scale);
    const hw = this.width / scale / 2;
    const hh = this.height / scale / 2;
    const hitR = 10; // hit radius for handles

    // Rotation handle (above top center)
    const rotHandleOffset = 28;
    const rotY = -(hh + rotHandleOffset);
    if (lx * lx + (ly - rotY) * (ly - rotY) < 16 * 16) return HANDLE.ROTATE;

    // Corner handles
    if (Math.hypot(lx - -hw, ly - -hh) < hitR) return HANDLE.TL;
    if (Math.hypot(lx - hw, ly - -hh) < hitR) return HANDLE.TR;
    if (Math.hypot(lx - hw, ly - hh) < hitR) return HANDLE.BR;
    if (Math.hypot(lx - -hw, ly - hh) < hitR) return HANDLE.BL;

    // Edge midpoint handles
    if (Math.hypot(lx - 0, ly - -hh) < hitR) return HANDLE.T;
    if (Math.hypot(lx - hw, ly - 0) < hitR) return HANDLE.R;
    if (Math.hypot(lx - 0, ly - hh) < hitR) return HANDLE.B;
    if (Math.hypot(lx - -hw, ly - 0) < hitR) return HANDLE.L;

    // Body
    if (lx >= -hw && lx <= hw && ly >= -hh && ly <= hh) return HANDLE.MOVE;

    return HANDLE.NONE;
  }
}

class DraggableText {
  constructor(text, textureSize, options = {}) {
    this.text = text;
    this.fontSize = options.fontSize || 80;
    this.color = options.color || "#000000";
    this.fontFamily = options.fontFamily || "Outfit, sans-serif";
    this.bold = options.bold || false;
    this.italic = options.italic || false;
    this.underline = options.underline || false;

    this.opacity = 1;
    this.rotation = 0;
    this.flipX = false;
    this.flipY = false;
    this.locked = false;
    this.bend = options.bend || 0;
    this.letterSpacing = options.letterSpacing || 0;

    this.updateDimensions();

    // Center initially
    this.x = (textureSize.width - this.width) / 2;
    this.y = (textureSize.height - this.height) / 2;
  }

  updateDimensions() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = `${this.italic ? "italic " : ""}${this.bold ? "bold " : ""}${this.fontSize}px ${this.fontFamily}`;

    const lines = this.text.split("\n");
    let maxWidth = 0;
    lines.forEach((line) => {
      let lineW = 0;
      if (this.letterSpacing) {
        const chars = line.split("");
        chars.forEach(
          (c) => (lineW += ctx.measureText(c).width + this.letterSpacing),
        );
        if (chars.length > 0) lineW -= this.letterSpacing;
      } else {
        lineW = ctx.measureText(line).width;
      }
      if (lineW > maxWidth) {
        maxWidth = lineW;
      }
    });

    // Add some padding to make selection/dragging easier
    this.nativeWidth = Math.max(100, maxWidth + 40);
    this.nativeHeight = this.fontSize * 1.3 * Math.max(1, lines.length);

    this.width = this.nativeWidth;
    this.height = this.nativeHeight;
  }

  clone(offset = 32) {
    const copy = Object.create(DraggableText.prototype);
    copy.text = this.text;
    copy.fontSize = this.fontSize;
    copy.color = this.color;
    copy.fontFamily = this.fontFamily;
    copy.bold = this.bold;
    copy.italic = this.italic;
    copy.underline = this.underline;
    copy.nativeWidth = this.nativeWidth;
    copy.nativeHeight = this.nativeHeight;
    copy.width = this.width;
    copy.height = this.height;
    copy.x = this.x + offset;
    copy.y = this.y + offset;
    copy.rotation = this.rotation;
    copy.opacity = this.opacity;
    copy.flipX = this.flipX;
    copy.flipY = this.flipY;
    copy.locked = this.locked;
    copy.bend = this.bend;
    copy.letterSpacing = this.letterSpacing;
    return copy;
  }

  getCenterTex() {
    return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
  }

  _toLocal(mx, my, scale) {
    const cx = (this.x + this.width / 2) / scale;
    const cy = (this.y + this.height / 2) / scale;
    const dx = mx - cx;
    const dy = my - cy;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    return {
      lx: dx * cos - dy * sin,
      ly: dx * sin + dy * cos,
    };
  }

  draw(ctx, scale, uvComponents = []) {
    ctx.save();

    // Clip to the selected faces if any
    if (
      this.selectedFaceIds &&
      this.selectedFaceIds.length > 0 &&
      uvComponents &&
      uvComponents.length > 0
    ) {
      ctx.beginPath();
      let hasPath = false;
      this.selectedFaceIds.forEach((fId) => {
        const comp = uvComponents.find((c) => c.id === fId);
        if (comp && comp.path && comp.path.length > 0) {
          ctx.moveTo(
            comp.path[0].u * ctx.canvas.width,
            comp.path[0].v * ctx.canvas.height,
          );
          for (let i = 1; i < comp.path.length; i++) {
            ctx.lineTo(
              comp.path[i].u * ctx.canvas.width,
              comp.path[i].v * ctx.canvas.height,
            );
          }
          hasPath = true;
        }
      });
      if (hasPath) {
        ctx.closePath();
        ctx.clip();
      }
    }

    ctx.globalAlpha = this.opacity;

    const scaledX = this.x / scale;
    const scaledY = this.y / scale;
    const scaledW = this.width / scale;
    const scaledH = this.height / scale;

    ctx.translate(scaledX + scaledW / 2, scaledY + scaledH / 2);
    ctx.rotate(this.rotation);
    ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);

    const scaleX = this.width / this.nativeWidth;
    const scaleY = this.height / this.nativeHeight;
    ctx.scale(scaleX, scaleY);

    ctx.fillStyle = this.color;
    ctx.font = `${this.italic ? "italic " : ""}${this.bold ? "bold " : ""}${this.fontSize / scale}px ${this.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = this.text.split("\n");
    const lineHeight = (this.fontSize / scale) * 1.3;
    const startY = (-(lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      const lineY = startY + i * lineHeight;

      let textWidth = 0;
      const charWidths = [];
      const chars = line.split("");
      chars.forEach((c) => {
        const w = ctx.measureText(c).width;
        charWidths.push(w);
        textWidth += w + (this.letterSpacing || 0);
      });
      if (chars.length > 0) textWidth -= this.letterSpacing || 0;

      if (!this.bend || Math.abs(this.bend) < 1) {
        if (!this.letterSpacing) {
          ctx.fillText(line, 0, lineY);
        } else {
          let currX = -textWidth / 2;
          chars.forEach((char, idx) => {
            const w = charWidths[idx];
            ctx.fillText(char, currX + w / 2, lineY);
            currX += w + this.letterSpacing;
          });
        }

        if (this.underline) {
          // Position underline just below the text baseline
          const underlineY = lineY + (this.fontSize / scale) * 0.4;
          const thickness = Math.max(1, this.fontSize / scale / 15);

          ctx.beginPath();
          ctx.strokeStyle = this.color;
          ctx.lineWidth = thickness;
          ctx.moveTo(-textWidth / 2, underlineY);
          ctx.lineTo(textWidth / 2, underlineY);
          ctx.stroke();
        }
      } else {
        // Draw curved text (fixed left-to-right reading direction)
        const angle = (this.bend / 100) * Math.PI;
        const R = textWidth / angle;
        let currentAngle = -angle / 2; // start on the left

        ctx.save();
        ctx.translate(0, lineY + R);

        chars.forEach((char, idx) => {
          const w = charWidths[idx];
          const charTotalW =
            w + (idx < chars.length - 1 ? this.letterSpacing || 0 : 0);
          const charAngle = charTotalW / R;

          // Place character in the center of its arc segment
          const theta = currentAngle + charAngle / 2;
          ctx.save();
          ctx.rotate(theta);
          ctx.translate(0, -R);
          ctx.fillText(char, 0, 0);

          if (this.underline) {
            const underlineY = (this.fontSize / scale) * 0.4;
            const thickness = Math.max(1, this.fontSize / scale / 15);
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = thickness;
            // Draw a straight line segment for this character
            ctx.moveTo(-charTotalW / 2, underlineY);
            ctx.lineTo(charTotalW / 2, underlineY);
            ctx.stroke();
          }

          ctx.restore();

          currentAngle += charAngle;
        });

        ctx.restore();
      }
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawControls(ctx, scale) {
    const scaledW = this.width / scale;
    const scaledH = this.height / scale;
    const cx = (this.x + this.width / 2) / scale;
    const cy = (this.y + this.height / 2) / scale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    // --- Bounding box ---
    ctx.strokeStyle = "#7c5cfc";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.strokeRect(-scaledW / 2, -scaledH / 2, scaledW, scaledH);

    // --- Corner handles (circles) ---
    const cornerRadius = 5;
    const corners = [
      [-scaledW / 2, -scaledH / 2],
      [scaledW / 2, -scaledH / 2],
      [scaledW / 2, scaledH / 2],
      [-scaledW / 2, scaledH / 2],
    ];

    corners.forEach(([hx, hy]) => {
      ctx.beginPath();
      ctx.arc(hx, hy, cornerRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#7c5cfc";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // --- Edge midpoint handles (small squares) ---
    const midSize = 4;
    const midpoints = [
      [0, -scaledH / 2], // top
      [scaledW / 2, 0], // right
      [0, scaledH / 2], // bottom
      [-scaledW / 2, 0], // left
    ];

    midpoints.forEach(([hx, hy]) => {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#7c5cfc";
      ctx.lineWidth = 2;
      ctx.fillRect(hx - midSize, hy - midSize, midSize * 2, midSize * 2);
      ctx.strokeRect(hx - midSize, hy - midSize, midSize * 2, midSize * 2);
    });

    // --- Rotation handle (top center, outside the box) ---
    const rotHandleOffset = 28;
    const rotHandleY = -(scaledH / 2 + rotHandleOffset);

    // Connecting line
    ctx.beginPath();
    ctx.moveTo(0, -scaledH / 2);
    ctx.lineTo(0, rotHandleY + 10);
    ctx.strokeStyle = "#7c5cfc";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rotation icon circle background
    ctx.beginPath();
    ctx.arc(0, rotHandleY, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#7c5cfc";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw rotation arrow icon
    ctx.save();
    ctx.translate(0, rotHandleY);
    ctx.strokeStyle = "#7c5cfc";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Circular arrow
    ctx.beginPath();
    ctx.arc(0, 0, 6, -Math.PI * 0.8, Math.PI * 0.5, false);
    ctx.stroke();

    // Arrow head
    const aex = 6 * Math.cos(Math.PI * 0.5);
    const aey = 6 * Math.sin(Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(aex - 3, aey - 2);
    ctx.lineTo(aex, aey);
    ctx.lineTo(aex + 3, aey - 2);
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }

  contains(mx, my, scale) {
    const { lx, ly } = this._toLocal(mx, my, scale);
    const hw = this.width / scale / 2;
    const hh = this.height / scale / 2;
    return lx >= -hw && lx <= hw && ly >= -hh && ly <= hh;
  }

  hitTest(mx, my, scale) {
    if (this.locked) return HANDLE.NONE;
    const { lx, ly } = this._toLocal(mx, my, scale);
    const hw = this.width / scale / 2;
    const hh = this.height / scale / 2;
    const hitR = 10;

    // Rotation handle
    const rotHandleOffset = 28;
    const rotY = -(hh + rotHandleOffset);
    if (lx * lx + (ly - rotY) * (ly - rotY) < 16 * 16) return HANDLE.ROTATE;

    // Corner handles
    if (Math.hypot(lx - -hw, ly - -hh) < hitR) return HANDLE.TL;
    if (Math.hypot(lx - hw, ly - -hh) < hitR) return HANDLE.TR;
    if (Math.hypot(lx - hw, ly - hh) < hitR) return HANDLE.BR;
    if (Math.hypot(lx - -hw, ly - hh) < hitR) return HANDLE.BL;

    // Edge midpoint handles
    if (Math.hypot(lx - 0, ly - -hh) < hitR) return HANDLE.T;
    if (Math.hypot(lx - hw, ly - 0) < hitR) return HANDLE.R;
    if (Math.hypot(lx - 0, ly - hh) < hitR) return HANDLE.B;
    if (Math.hypot(lx - -hw, ly - 0) < hitR) return HANDLE.L;

    // Body
    if (lx >= -hw && lx <= hw && ly >= -hh && ly <= hh) return HANDLE.MOVE;

    return HANDLE.NONE;
  }
}

function drawUVs(
  mesh,
  components,
  faceColors,
  selectedFaces,
  ctx,
  w,
  h,
  drawFull,
  modelUrl,
  uvTapeMerged,
) {
  const geometry = mesh.geometry;
  if (!geometry.attributes.uv) {
    console.warn("[drawUVs] No UV attribute on mesh:", mesh.name);
    return;
  }

  const uvAttr = geometry.attributes.uv;
  const posAttr = geometry.attributes.position;
  const index = geometry.index;

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // 1. Draw filled components (faces)
  components.forEach((comp) => {
    if (!comp.loops || comp.loops.length === 0) return;

    ctx.beginPath();
    comp.loops.forEach((loop) => {
      if (loop.length === 0) return;
      ctx.moveTo(loop[0].u * w, loop[0].v * h);
      for (let i = 1; i < loop.length; i++) {
        ctx.lineTo(loop[i].u * w, loop[i].v * h);
      }
      ctx.closePath();
    });

    // Fill face color
    const color = faceColors[comp.id];
    if (color) {
      ctx.fillStyle = color;
      ctx.fill();
    }
  });

  // 2. Stroke wireframe or outlines as gray dashed
  ctx.save();
  ctx.strokeStyle = "#9ca3af"; // gray-400
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  const isTapeModel = modelUrl && modelUrl.includes("Tape");
  const shouldDrawFull =
    !isTapeModel && (drawFull || !components || components.length === 0);

  if (shouldDrawFull) {
    ctx.beginPath();
    const drawLine = (idx1, idx2) => {
      const u1 = uvAttr.getX(idx1);
      const v1 = uvAttr.getY(idx1);
      const u2 = uvAttr.getX(idx2);
      const v2 = uvAttr.getY(idx2);
      ctx.moveTo(u1 * w, v1 * h);
      ctx.lineTo(u2 * w, v2 * h);
    };

    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        const a = index.getX(i);
        const b = index.getX(i + 1);
        const c = index.getX(i + 2);
        drawLine(a, b);
        drawLine(b, c);
        drawLine(c, a);
      }
    } else {
      for (let i = 0; i < uvAttr.count; i += 3) {
        drawLine(i, i + 1);
        drawLine(i + 1, i + 2);
        drawLine(i + 2, i);
      }
    }
    ctx.stroke();
  } else {
    if (isTapeModel && uvTapeMerged) {
      const { mergedGroups, nonMerged } = uvTapeMerged;

      Object.values(mergedGroups).forEach((group) => {
        ctx.beginPath();
        ctx.rect(
          group.minU * w,
          group.minV * h,
          (group.maxU - group.minU) * w,
          (group.maxV - group.minV) * h,
        );
        ctx.stroke();
      });

      nonMerged.forEach((comp) => {
        ctx.beginPath();
        comp.loops.forEach((loop) => {
          if (loop.length === 0) return;
          ctx.moveTo(loop[0].u * w, loop[0].v * h);
          for (let i = 1; i < loop.length; i++) {
            ctx.lineTo(loop[i].u * w, loop[i].v * h);
          }
          ctx.closePath();
        });
        ctx.stroke();
      });
    } else {
      // Stroke individual components normally
      components.forEach((comp) => {
        if (!comp.loops || comp.loops.length === 0) return;
        ctx.beginPath();
        comp.loops.forEach((loop) => {
          if (loop.length === 0) return;
          ctx.moveTo(loop[0].u * w, loop[0].v * h);
          for (let i = 1; i < loop.length; i++) {
            ctx.lineTo(loop[i].u * w, loop[i].v * h);
          }
          ctx.closePath();
        });
        ctx.stroke();
      });
    }
  }
  ctx.restore();

  // 3. Highlight selected faces with solid blue border
  if (selectedFaces && selectedFaces.size > 0) {
    if (isTapeModel && uvTapeMerged) {
      const selectedMergedGroups = {};
      const selectedNonMerged = [];

      selectedFaces.forEach((fId) => {
        // Fast lookup via uvTapeMerged
        let foundInGroup = false;
        for (const group of Object.values(uvTapeMerged.mergedGroups)) {
          if (group.comps.some((c) => c.id === fId)) {
            // Use the group's key to deduplicate
            const key = group.minU.toFixed(2) + "_" + group.maxU.toFixed(2);
            selectedMergedGroups[key] = group;
            foundInGroup = true;
            break;
          }
        }
        if (!foundInGroup) {
          const comp = uvTapeMerged.nonMerged.find((c) => c.id === fId);
          if (comp) selectedNonMerged.push(comp);
        }
      });

      Object.values(selectedMergedGroups).forEach((group) => {
        ctx.beginPath();
        ctx.rect(
          group.minU * w,
          group.minV * h,
          (group.maxU - group.minU) * w,
          (group.maxV - group.minV) * h,
        );
        ctx.strokeStyle = "#3b82f6"; // solid blue-500
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      selectedNonMerged.forEach((comp) => {
        ctx.beginPath();
        comp.loops.forEach((loop) => {
          if (loop.length === 0) return;
          ctx.moveTo(loop[0].u * w, loop[0].v * h);
          for (let i = 1; i < loop.length; i++) {
            ctx.lineTo(loop[i].u * w, loop[i].v * h);
          }
          ctx.closePath();
        });
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    } else {
      selectedFaces.forEach((fId) => {
        const comp = components.find((c) => c.id === fId);
        if (comp && comp.loops && comp.loops.length > 0) {
          ctx.beginPath();
          comp.loops.forEach((loop) => {
            if (loop.length === 0) return;
            ctx.moveTo(loop[0].u * w, loop[0].v * h);
            for (let i = 1; i < loop.length; i++) {
              ctx.lineTo(loop[i].u * w, loop[i].v * h);
            }
            ctx.closePath();
          });

          ctx.strokeStyle = "#3b82f6"; // solid blue-500
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }
  }

  ctx.restore();
}

function pointInPolygon(point, vs) {
  if (!vs || vs.length < 3) return false;
  let x = point.u,
    y = point.v;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].u,
      yi = vs[i].v;
    let xj = vs[j].u,
      yj = vs[j].v;
    let intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function orderEdgesToPaths(edges) {
  if (edges.length === 0) return [];
  const edgeMap = new Map();
  edges.forEach((e) => {
    if (!edgeMap.has(e.k1)) edgeMap.set(e.k1, []);
    if (!edgeMap.has(e.k2)) edgeMap.set(e.k2, []);
    edgeMap.get(e.k1).push(e);
    edgeMap.get(e.k2).push(e);
  });

  const loops = [];
  const usedEdges = new Set();

  while (usedEdges.size < edges.length) {
    let startEdge = edges.find((e) => !usedEdges.has(e));
    if (!startEdge) break;

    const path = [];
    let currentEdge = startEdge;
    usedEdges.add(currentEdge);
    path.push(currentEdge.p1);
    let currentKey = currentEdge.k2;

    while (true) {
      path.push(
        currentEdge.k1 === currentKey ? currentEdge.p1 : currentEdge.p2,
      );

      const connected = edgeMap.get(currentKey);
      if (!connected) break;
      const nextEdge = connected.find((e) => !usedEdges.has(e));
      if (!nextEdge) break;

      currentEdge = nextEdge;
      usedEdges.add(currentEdge);
      currentKey =
        currentEdge.k1 === currentKey ? currentEdge.k2 : currentEdge.k1;
    }
    loops.push(path);
  }
  return loops;
}

export function extractUvComponents(mesh, modelUrl) {
  const geometry = mesh?.geometry;
  if (!geometry || !geometry.attributes.uv) return [];

  const uvAttr = geometry.attributes.uv;
  const posAttr = geometry.attributes.position;
  const index = geometry.index;

  const uvPrecision = 100000;

  const getUvPoint = (vertexIndex) => ({
    u: Math.round(uvAttr.getX(vertexIndex) * uvPrecision) / uvPrecision,
    v: Math.round(uvAttr.getY(vertexIndex) * uvPrecision) / uvPrecision,
  });

  const pointKey = (point) => `${point.u},${point.v}`;

  const getNormal = (a, b, c) => {
    if (!posAttr) return { x: 0, y: 0, z: 1 };
    const ax = posAttr.getX(a),
      ay = posAttr.getY(a),
      az = posAttr.getZ(a);
    const bx = posAttr.getX(b),
      by = posAttr.getY(b),
      bz = posAttr.getZ(b);
    const cx = posAttr.getX(c),
      cy = posAttr.getY(c),
      cz = posAttr.getZ(c);

    const ux = cx - bx,
      uy = cy - by,
      uz = cz - bz;
    const vx = ax - bx,
      vy = ay - by,
      vz = az - bz;

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;

    const len = Math.hypot(nx, ny, nz);
    if (len > 0) {
      nx /= len;
      ny /= len;
      nz /= len;
    }
    return { x: nx, y: ny, z: nz };
  };

  const dot = (n1, n2) => n1.x * n2.x + n1.y * n2.y + n1.z * n2.z;

  const triangles = [];
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      triangles.push({
        id: i / 3,
        a: index.getX(i),
        b: index.getX(i + 1),
        c: index.getX(i + 2),
        normal: getNormal(index.getX(i), index.getX(i + 1), index.getX(i + 2)),
      });
    }
  } else {
    for (let i = 0; i < uvAttr.count; i += 3) {
      triangles.push({
        id: i / 3,
        a: i,
        b: i + 1,
        c: i + 2,
        normal: getNormal(i, i + 1, i + 2),
      });
    }
  }

  const uvEdgeMap = new Map();
  triangles.forEach((tri) => {
    const addTriEdge = (a, b) => {
      const p1 = getUvPoint(a);
      const p2 = getUvPoint(b);
      const k1 = pointKey(p1);
      const k2 = pointKey(p2);
      if (k1 === k2) return;
      const key = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
      if (!uvEdgeMap.has(key)) uvEdgeMap.set(key, { p1, p2, k1, k2, tris: [] });
      uvEdgeMap.get(key).tris.push(tri.id);
    };
    addTriEdge(tri.a, tri.b);
    addTriEdge(tri.b, tri.c);
    addTriEdge(tri.c, tri.a);
  });

  const parent = Array(triangles.length)
    .fill(0)
    .map((_, i) => i);
  const find = (i) => {
    if (parent[i] === i) return i;
    return (parent[i] = find(parent[i]));
  };
  const union = (i, j) => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) parent[rootI] = rootJ;
  };

  let isBoxModel = false;
  if (modelUrl) {
    const urlLower = modelUrl.toLowerCase();
    if (
      urlLower.includes("box") ||
      urlLower.includes("rect") ||
      urlLower.includes("square") ||
      urlLower.includes("sq") ||
      urlLower.includes("pizza") ||
      urlLower.includes("sweet") ||
      urlLower.includes("packaging") ||
      urlLower.includes("biriyani")
    ) {
      isBoxModel = true;
    }
  }

  // Check mesh names in the GLTF (which are fully preserved in production/development builds)
  if (!isBoxModel && mesh) {
    const meshName = (mesh.name || "").toLowerCase();
    const parentName = (mesh.parent?.name || "").toLowerCase();
    const combinedName = `${meshName} ${parentName}`;
    if (
      combinedName.includes("box") ||
      combinedName.includes("rect") ||
      combinedName.includes("square") ||
      combinedName.includes("sweet") ||
      combinedName.includes("pizza") ||
      combinedName.includes("packaging") ||
      combinedName.includes("biriyani") ||
      combinedName.includes("bt") || // matches 650 BT, 1000 BT (rectangular containers)
      combinedName.includes("sb") // matches SB 250, SB TE 500 (sweet boxes)
    ) {
      isBoxModel = true;
    }
  }

  // Geometric classification fallback (100% reliable for generic names & blob uploads)
  if (!isBoxModel) {
    const uniqueNormals = new Set();
    triangles.forEach((tri) => {
      if (tri.normal) {
        const nx = Math.round(tri.normal.x * 10) / 10;
        const ny = Math.round(tri.normal.y * 10) / 10;
        const nz = Math.round(tri.normal.z * 10) / 10;
        uniqueNormals.add(`${nx},${ny},${nz}`);
      }
    });
    // A box typically has <= 20 unique normal directions. A cylinder/cup/round container has >= 26.
    if (uniqueNormals.size <= 20) {
      isBoxModel = true;
    }
  }

  for (const edge of uvEdgeMap.values()) {
    if (edge.tris.length >= 2) {
      const t1 = triangles[edge.tris[0]];
      if (t1 && t1.normal) {
        for (let i = 1; i < edge.tris.length; i++) {
          const t2 = triangles[edge.tris[i]];
          if (t2 && t2.normal) {
            const d = dot(t1.normal, t2.normal);
            if (d > 0.3) {
              if (isBoxModel && d < 0.99) {
                const dx = Math.abs(edge.p1.u - edge.p2.u);
                const dy = Math.abs(edge.p1.v - edge.p2.v);
                const isAxisAligned = dx < 0.01 || dy < 0.01;
                if (isAxisAligned) continue;
              }
              union(t1.id, t2.id);
            }
          }
        }
      }
    }
  }

  const faceMap = new Map();
  triangles.forEach((tri) => {
    const root = find(tri.id);
    if (!faceMap.has(root)) faceMap.set(root, []);
    faceMap.get(root).push(tri.id);
  });

  const finalComponents = [];
  let faceCounter = 0;

  for (const triIds of faceMap.values()) {
    const faceTriSet = new Set(triIds);
    const outlineEdges = [];
    let minU = Infinity,
      maxU = -Infinity,
      minV = Infinity,
      maxV = -Infinity;

    triIds.forEach((triId) => {
      const tri = triangles[triId];
      const checkEdge = (a, b) => {
        const p1 = getUvPoint(a);
        const p2 = getUvPoint(b);
        const k1 = pointKey(p1);
        const k2 = pointKey(p2);
        if (k1 === k2) return;
        const key = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
        const edge = uvEdgeMap.get(key);

        let isBoundary = true;
        if (edge && edge.tris.length >= 2) {
          let countInFace = 0;
          for (const tId of edge.tris) {
            if (faceTriSet.has(tId)) {
              countInFace++;
            }
          }
          if (countInFace >= 2) {
            isBoundary = false;
          }
        }

        if (isBoundary) {
          outlineEdges.push({ p1, p2, k1, k2 });
          minU = Math.min(minU, p1.u, p2.u);
          maxU = Math.max(maxU, p1.u, p2.u);
          minV = Math.min(minV, p1.v, p2.v);
          maxV = Math.max(maxV, p1.v, p2.v);
        }
      };
      checkEdge(tri.a, tri.b);
      checkEdge(tri.b, tri.c);
      checkEdge(tri.c, tri.a);
    });

    if (outlineEdges.length < 3) continue;

    const area = (maxU - minU) * (maxV - minV);
    const loops = orderEdgesToPaths(outlineEdges);

    const loopsWithArea = loops.map((loop) => {
      let loopArea = 0;
      if (loop.length >= 3) {
        for (let i = 0; i < loop.length; i++) {
          let p1 = loop[i];
          let p2 = loop[(i + 1) % loop.length];
          loopArea += p1.u * p2.v - p2.u * p1.v;
        }
      }
      return { loop, area: Math.abs(loopArea / 2) };
    });

    const validLoopsInfo = loopsWithArea
      .filter((info) => info.area > 0.0001)
      .sort((a, b) => b.area - a.area);

    if (validLoopsInfo.length > 0) {
      finalComponents.push({
        id: `face_${faceCounter++}`,
        path: validLoopsInfo[0].loop,
        loops: validLoopsInfo.map((info) => info.loop),
        minU,
        maxU,
        minV,
        maxV,
        area,
      });
    }
  }

  // Deduplicate overlapping components (e.g. inner/outer faces of boxes)
  const deduplicatedComponents = [];
  for (const comp of finalComponents) {
    const isDuplicate = deduplicatedComponents.some(
      (existing) =>
        Math.abs(existing.minU - comp.minU) < 0.005 &&
        Math.abs(existing.maxU - comp.maxU) < 0.005 &&
        Math.abs(existing.minV - comp.minV) < 0.005 &&
        Math.abs(existing.maxV - comp.maxV) < 0.005,
    );
    if (!isDuplicate) {
      deduplicatedComponents.push(comp);
    }
  }

  return deduplicatedComponents;
}

function estimateTextureSizeFromUv(mesh) {
  const geometry = mesh?.geometry;
  const uvAttr = geometry?.attributes?.uv;
  if (!uvAttr) return DEFAULT_TEXTURE_SIZE;

  const index = geometry.index;
  let minU = Infinity,
    maxU = -Infinity,
    minV = Infinity,
    maxV = -Infinity;
  const parent = Array.from({ length: uvAttr.count }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };

  const readTriangle = (i) =>
    index
      ? [index.getX(i), index.getX(i + 1), index.getX(i + 2)]
      : [i, i + 1, i + 2];

  const triangleCount = index ? index.count : uvAttr.count;
  for (let i = 0; i < triangleCount; i += 3) {
    const [a, b, c] = readTriangle(i);
    union(a, b);
    union(b, c);
  }

  const islands = new Map();
  for (let i = 0; i < uvAttr.count; i++) {
    const root = find(i);
    const u = uvAttr.getX(i);
    const v = uvAttr.getY(i);
    const island = islands.get(root) || {
      minU: Infinity,
      maxU: -Infinity,
      minV: Infinity,
      maxV: -Infinity,
      count: 0,
    };
    island.minU = Math.min(island.minU, u);
    island.maxU = Math.max(island.maxU, u);
    island.minV = Math.min(island.minV, v);
    island.maxV = Math.max(island.maxV, v);
    island.count += 1;
    islands.set(root, island);
    minU = Math.min(minU, u);
    maxU = Math.max(maxU, u);
    minV = Math.min(minV, v);
    maxV = Math.max(maxV, v);
  }

  const layoutWidth = maxU - minU;
  const layoutHeight = maxV - minV;
  const layoutAspect = layoutHeight / layoutWidth;
  if (
    layoutWidth <= 0 ||
    layoutHeight <= 0 ||
    layoutAspect < 0.9 ||
    layoutAspect > 1.1
  ) {
    return DEFAULT_TEXTURE_SIZE;
  }

  let bestAspect = 1;
  let bestScore = 0;
  let hasWideCompanionIsland = false;
  islands.forEach((island) => {
    const width = island.maxU - island.minU;
    const height = island.maxV - island.minV;
    const area = width * height;
    if (width <= 0 || height <= 0 || area < 0.01) return;
    const rawAspect = height / width;
    const score = area * island.count;
    if (rawAspect < 0.5 && area > 0.05) hasWideCompanionIsland = true;
    if (rawAspect > 1.2 && score > bestScore) {
      bestAspect = rawAspect;
      bestScore = score;
    }
  });

  if (!hasWideCompanionIsland || bestAspect === 1) return DEFAULT_TEXTURE_SIZE;

  return {
    width: TEXTURE_WIDTH,
    height: Math.round(TEXTURE_WIDTH / bestAspect),
  };
}

const Canvas = forwardRef(
  (
    {
      textureCanvasRef,
      onTextureUpdated,
      modelUrl,
      showUv,
      fullUv,
      bgColor,
      isActive,
      appliedMaterials,
      onSelectedLayerChange,
      onFaceSelectionChange,
      onOpenTapeLayout,
    },
    ref,
  ) => {
    const displayCanvasRef = useRef(null);
    const containerRef = useRef(null);

    const imagesRef = useRef([]);
    const selectedImageRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Inline text editing overlay
    const [editingText, setEditingText] = useState(null); // { layer, x, y, w, h }
    const onSelectedLayerChangeRef = useRef(onSelectedLayerChange);
    useEffect(() => {
      onSelectedLayerChangeRef.current = onSelectedLayerChange;
    }, [onSelectedLayerChange]);

    const onFaceSelectionChangeRef = useRef(onFaceSelectionChange);
    useEffect(() => {
      onFaceSelectionChangeRef.current = onFaceSelectionChange;
    }, [onFaceSelectionChange]);
    const contextMenuTargetRef = useRef(null);
    const [contextMenu, setContextMenu] = useState({
      open: false,
      x: 0,
      y: 0,
      mode: "image",
    });

    // Global View & Tool States
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [toolMode, setToolMode] = useState("cursor"); // "cursor" | "hand" | "multiselect" | "eraser"
    const toolModeRef = useRef(toolMode);
    useEffect(() => {
      toolModeRef.current = toolMode;
    }, [toolMode]);
    const [eraserTolerance, setEraserTolerance] = useState(30);
    const [eraserTargetColor, setEraserTargetColor] = useState(null);

    // History State
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // UV Interaction States
    const [uvComponents, setUvComponents] = useState([]);
    const uvComponentsRef = useRef([]); // for sync access in event handlers
    const uvTapeMergedRef = useRef(null); // Cache for merged Tape model components
    const [selectedFace, setSelectedFace] = useState(null);
    const [selectedFaceUv, setSelectedFaceUv] = useState(null);
    const [selectedFaces, setSelectedFacesState] = useState(new Set());
    const selectedFacesRef = useRef(new Set());
    const setSelectedFaces = useCallback((val) => {
      const next =
        typeof val === "function" ? val(selectedFacesRef.current) : val;
      selectedFacesRef.current = next;
      setSelectedFacesState(next);
      onFaceSelectionChangeRef.current?.(next);
    }, []);
    const [faceColors, setFaceColors] = useState({});
    const faceColorsRef = useRef({});

    const interactionRef = useRef({
      isDragging: false,
      mode: HANDLE.NONE,
      startMx: 0,
      startMy: 0,
      startImgX: 0,
      startImgY: 0,
      startImgW: 0,
      startImgH: 0,
      startRotation: 0,
      startAngle: 0,
      aspectRatio: 1,
    });

    const currentMeshRef = useRef(null);
    const canvasScaleRef = useRef(1);
    const textureSizeRef = useRef(DEFAULT_TEXTURE_SIZE);
    const onTextureUpdatedRef = useRef(onTextureUpdated);
    const rafIdRef = useRef(null);
    const bakeTimeoutRef = useRef(null);
    const needsDisplayRedrawRef = useRef(false);

    // Initialize bake canvas
    useEffect(() => {
      if (!textureCanvasRef) return;
      if (textureCanvasRef.current) return;

      const canvas = document.createElement("canvas");
      canvas.width = DEFAULT_TEXTURE_SIZE.width;
      canvas.height = DEFAULT_TEXTURE_SIZE.height;
      textureCanvasRef.current = canvas;
    }, [textureCanvasRef]);

    useEffect(() => {
      onTextureUpdatedRef.current = onTextureUpdated;
    }, [onTextureUpdated]);

    const resizeTextureCanvas = useCallback(
      (nextSize) => {
        const width = Math.max(1, Math.round(nextSize.width));
        const height = Math.max(1, Math.round(nextSize.height));
        const previousSize = textureSizeRef.current;

        if (previousSize.width !== width || previousSize.height !== height) {
          const scaleX = width / previousSize.width;
          const scaleY = height / previousSize.height;
          imagesRef.current.forEach((img) => {
            // Preserve image aspect ratio by using a uniform scale
            const uniformScale = Math.min(scaleX, scaleY);
            // Keep the center of the image in the same relative position
            const cx = img.x + img.width / 2;
            const cy = img.y + img.height / 2;

            img.width *= uniformScale;
            img.height *= uniformScale;

            img.x = cx * scaleX - img.width / 2;
            img.y = cy * scaleY - img.height / 2;
          });
        }

        textureSizeRef.current = { width, height };

        const bakeCanvas = textureCanvasRef.current;
        if (
          bakeCanvas &&
          (bakeCanvas.width !== width || bakeCanvas.height !== height)
        ) {
          bakeCanvas.width = width;
          bakeCanvas.height = height;
        }
      },
      [textureCanvasRef],
    );

    const getTextureSizeFromGltf = (gltf) => {
      let foundSize = null;

      gltf.scene.traverse((child) => {
        if (foundSize || !child.isMesh) return;

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        for (const material of materials) {
          const image = material?.map?.image;
          const width =
            image?.naturalWidth || image?.videoWidth || image?.width;
          const height =
            image?.naturalHeight || image?.videoHeight || image?.height;

          if (width && height) {
            foundSize = { width, height };
            break;
          }
        }
      });

      if (!foundSize) return null;

      const aspect = foundSize.width / foundSize.height;
      return {
        width: TEXTURE_WIDTH,
        height: Math.round(TEXTURE_WIDTH / aspect),
      };
    };

    // --- Separated rendering: display (instant) vs bake (debounced) ---

    const redrawDisplay = useCallback(() => {
      const displayCanvas = displayCanvasRef.current;
      if (!displayCanvas) return;
      const ctx = displayCanvas.getContext("2d");
      const w = displayCanvas.width;
      const h = displayCanvas.height;

      ctx.clearRect(0, 0, w, h);

      if (showUv && currentMeshRef.current) {
        drawUVs(
          currentMeshRef.current,
          uvComponentsRef.current,
          faceColors,
          selectedFaces,
          ctx,
          w,
          h,
          fullUv,
          modelUrl,
          uvTapeMergedRef.current,
        );
      }

      const scale = canvasScaleRef.current;
      imagesRef.current.forEach((img) => {
        img.draw(ctx, scale, uvComponentsRef.current);
      });

      // Draw controls for selected image LAST (on top)
      if (
        selectedImageRef.current &&
        toolModeRef.current !== "eraser" &&
        toolModeRef.current !== "eraser-pick"
      ) {
        selectedImageRef.current.drawControls(ctx, scale);
      }
    }, [showUv, fullUv, faceColors, selectedFaces]);

    const bakeTexture = useCallback(
      (ignoreSelection = false) => {
        const bakeCanvas = textureCanvasRef.current;
        if (!bakeCanvas) return;
        const bakeCtx = bakeCanvas.getContext("2d");

        bakeCtx.clearRect(0, 0, bakeCanvas.width, bakeCanvas.height);

        // We always want a transparent background for the base texture
        // so that PBR materials can show through where no artwork/color is applied.
        // We do NOT fill the background with bgColor here anymore.

        // Bake Face Colors first
        uvComponentsRef.current.forEach((comp) => {
          const color = faceColors[comp.id];
          if (color && comp.path && comp.path.length > 0) {
            bakeCtx.beginPath();
            bakeCtx.moveTo(
              comp.path[0].u * bakeCanvas.width,
              comp.path[0].v * bakeCanvas.height,
            );
            for (let i = 1; i < comp.path.length; i++) {
              bakeCtx.lineTo(
                comp.path[i].u * bakeCanvas.width,
                comp.path[i].v * bakeCanvas.height,
              );
            }
            bakeCtx.closePath();
            bakeCtx.fillStyle = color;
            bakeCtx.fill();
          }
        });

        // --- Highlight Selected Faces in 3D ---
        if (selectedFaces && selectedFaces.size > 0 && !ignoreSelection) {
          selectedFaces.forEach((fId) => {
            const comp = uvComponentsRef.current.find((c) => c.id === fId);
            if (comp && comp.path && comp.path.length > 0) {
              bakeCtx.save();
              bakeCtx.beginPath();
              bakeCtx.moveTo(
                comp.path[0].u * bakeCanvas.width,
                comp.path[0].v * bakeCanvas.height,
              );
              for (let i = 1; i < comp.path.length; i++) {
                bakeCtx.lineTo(
                  comp.path[i].u * bakeCanvas.width,
                  comp.path[i].v * bakeCanvas.height,
                );
              }
              bakeCtx.closePath();

              // If uncolored, draw a soft blue fill so it's obviously selected
              if (!faceColors[fId]) {
                bakeCtx.fillStyle = "rgba(59, 130, 246, 0.3)";
                bakeCtx.fill();
              }

              // Clip and draw a VERY thick inner blue border
              bakeCtx.clip();
              bakeCtx.lineWidth = 20; // 10px visible inner stroke
              bakeCtx.strokeStyle = "#2563eb"; // strong blue
              bakeCtx.stroke();

              bakeCtx.restore();
            }
          });
        }
        imagesRef.current.forEach((item) => {
          item.draw(bakeCtx, 1, uvComponentsRef.current);
        });

        onTextureUpdatedRef.current();
      },
      [bgColor, faceColors, selectedFaces, textureCanvasRef, appliedMaterials],
    );

    // --- History Logic ---
    const pushHistory = useCallback(
      (actionImages, actionFaceColors) => {
        const stateSnapshot = {
          images: actionImages.map((item) => {
            if (item instanceof DraggableText) {
              return {
                type: "text",
                text: item.text,
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                rotation: item.rotation,
                opacity: item.opacity,
                flipX: item.flipX,
                flipY: item.flipY,
                locked: item.locked,
                fontSize: item.fontSize,
                color: item.color,
                fontFamily: item.fontFamily,
                bold: item.bold,
                italic: item.italic,
                underline: item.underline,
              };
            }
            return {
              type: "image",
              src: item.img.src,
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
              rotation: item.rotation,
              opacity: item.opacity,
              flipX: item.flipX,
              flipY: item.flipY,
              locked: item.locked,
            };
          }),
          faceColors: { ...actionFaceColors },
        };

        setHistory((prev) => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(stateSnapshot);
          return newHistory;
        });
        setHistoryIndex((prev) => prev + 1);
      },
      [historyIndex],
    );

    const restoreHistoryState = useCallback(
      (state) => {
        if (!state) return;
        setFaceColors(state.faceColors);
        faceColorsRef.current = state.faceColors;

        const newImages = state.images.map((itemData) => {
          if (itemData.type === "text") {
            const dt = new DraggableText(
              itemData.text,
              textureSizeRef.current,
              {
                fontSize: itemData.fontSize,
                color: itemData.color,
                fontFamily: itemData.fontFamily,
                bold: itemData.bold,
                italic: itemData.italic,
                underline: itemData.underline,
              },
            );
            dt.x = itemData.x;
            dt.y = itemData.y;
            dt.width = itemData.width;
            dt.height = itemData.height;
            dt.rotation = itemData.rotation;
            dt.opacity = itemData.opacity !== undefined ? itemData.opacity : 1;
            dt.flipX = itemData.flipX || false;
            dt.flipY = itemData.flipY || false;
            dt.locked = itemData.locked || false;
            return dt;
          }
          const imgEl = new Image();
          imgEl.src = itemData.src;
          const di = new DraggableImage(imgEl, textureSizeRef.current);
          di.x = itemData.x;
          di.y = itemData.y;
          di.width = itemData.width;
          di.height = itemData.height;
          di.rotation = itemData.rotation;
          di.opacity = itemData.opacity !== undefined ? itemData.opacity : 1;
          di.flipX = itemData.flipX || false;
          di.flipY = itemData.flipY || false;
          di.locked = itemData.locked || false;
          return di;
        });

        imagesRef.current = newImages;
        setSelectedImage(null);
        selectedImageRef.current = null;
        needsDisplayRedrawRef.current = true;
        bakeTexture();
        redrawDisplay();
      },
      [bakeTexture, redrawDisplay],
    );

    const undo = useCallback(() => {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        restoreHistoryState(history[newIndex]);
        setHistoryIndex(newIndex);
      }
    }, [history, historyIndex, restoreHistoryState]);

    const redo = useCallback(() => {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        restoreHistoryState(history[newIndex]);
        setHistoryIndex(newIndex);
      }
    }, [history, historyIndex, restoreHistoryState]);

    const saveState = useCallback(() => {
      pushHistory(imagesRef.current, faceColorsRef.current);
    }, [pushHistory]);

    // Initial history state
    useEffect(() => {
      if (history.length === 0 && imagesRef.current) {
        pushHistory(imagesRef.current, faceColorsRef.current);
      }
    }, []); // Run once

    // Debounced bake — called after interaction settles
    const scheduleBake = useCallback(() => {
      if (bakeTimeoutRef.current) clearTimeout(bakeTimeoutRef.current);
      bakeTimeoutRef.current = setTimeout(() => {
        bakeTexture();
      }, 16); // ~1 frame delay
    }, [bakeTexture]);

    // Full redraw (both display + bake) — used for non-interactive updates
    const redrawAll = useCallback(() => {
      redrawDisplay();
      bakeTexture();
    }, [redrawDisplay, bakeTexture]);

    const copiedLayerRef = useRef(null);

    useEffect(() => {
      const handleKeyDown = (e) => {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "SELECT" ||
            activeEl.tagName === "TEXTAREA" ||
            activeEl.isContentEditable)
        ) {
          return;
        }

        const isModKey = e.metaKey || e.ctrlKey;
        const sel = selectedImageRef.current;

        // 1. Undo: Cmd/Ctrl + Z
        if (isModKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        }

        // 2. Redo: Cmd/Ctrl + Y or Cmd/Ctrl + Shift + Z
        if (
          (isModKey && e.key.toLowerCase() === "y") ||
          (isModKey && e.shiftKey && e.key.toLowerCase() === "z")
        ) {
          e.preventDefault();
          redo();
        }

        // 3. Delete / Backspace: Delete selected layer
        if (e.key === "Delete" || e.key === "Backspace") {
          if (sel) {
            e.preventDefault();
            onDelete();
          }
        }

        // 4. Copy: Cmd/Ctrl + C
        if (isModKey && e.key.toLowerCase() === "c") {
          if (sel) {
            e.preventDefault();
            copiedLayerRef.current = sel.clone(0);
          }
        }

        // 5. Paste: Cmd/Ctrl + V
        if (isModKey && e.key.toLowerCase() === "v") {
          if (copiedLayerRef.current) {
            e.preventDefault();
            const pasted = copiedLayerRef.current.clone(30);
            imagesRef.current.push(pasted);
            setSelectedImage(pasted);
            selectedImageRef.current = pasted;
            needsDisplayRedrawRef.current = true;
            bakeTexture();
            saveState();
            redrawDisplay();
            copiedLayerRef.current = pasted;
          }
        }

        // 6. Duplicate: Cmd/Ctrl + D
        if (isModKey && e.key.toLowerCase() === "d") {
          if (sel) {
            e.preventDefault();
            const copy = sel.clone(30);
            imagesRef.current.push(copy);
            setSelectedImage(copy);
            selectedImageRef.current = copy;
            needsDisplayRedrawRef.current = true;
            bakeTexture();
            saveState();
            redrawDisplay();
          }
        }

        // 7. V or S -> select/cursor tool
        if (
          !isModKey &&
          (e.key.toLowerCase() === "v" || e.key.toLowerCase() === "s")
        ) {
          e.preventDefault();
          setToolMode("cursor");
        }

        // 8. H -> hand/pan tool
        if (!isModKey && e.key.toLowerCase() === "h") {
          e.preventDefault();
          setToolMode("hand");
        }

        // 9. M -> multiselect tool
        if (!isModKey && e.key.toLowerCase() === "m") {
          e.preventDefault();
          setToolMode("multiselect");
        }

        // 10. Esc -> deselect all
        if (e.key === "Escape") {
          e.preventDefault();
          setSelectedFaces(new Set());
          setSelectedFace(null);
          setSelectedFaceUv(null);
          selectedImageRef.current = null;
          setSelectedImage(null);
          onSelectedLayerChangeRef.current?.(null);
          setContextMenu({ ...contextMenu, open: false });
        }

        // 11. Arrow Keys: nudge selected image
        if (
          sel &&
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault();
          const nudgeAmount = e.shiftKey ? 10 : 1;
          const scale = canvasScaleRef.current || 1;
          const nudgeGlobal = nudgeAmount * scale;

          if (e.key === "ArrowUp") sel.y -= nudgeGlobal;
          if (e.key === "ArrowDown") sel.y += nudgeGlobal;
          if (e.key === "ArrowLeft") sel.x -= nudgeGlobal;
          if (e.key === "ArrowRight") sel.x += nudgeGlobal;

          sel.fitType = null;
          sel.selectedFaceIds = [];

          needsDisplayRedrawRef.current = true;
          bakeTexture();
          saveState();
          redrawDisplay();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [undo, redo, toolMode, contextMenu]);

    const resizeDisplayCanvas = useCallback(() => {
      if (!containerRef.current || !displayCanvasRef.current) return;

      const container = containerRef.current;
      const padding = 40;
      const textureSize = textureSizeRef.current;
      const aspect = textureSize.width / textureSize.height;
      const maxWidth = Math.max(1, container.clientWidth - padding);
      const heightScale = aspect > 1.5 ? WIDE_TEXTURE_DISPLAY_SCALE : 0.85;
      const maxHeight = Math.max(
        1,
        (container.clientHeight - padding) * heightScale,
      );
      let width = maxWidth;
      let height = width / aspect;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspect;
      }

      displayCanvasRef.current.width = Math.round(width);
      displayCanvasRef.current.height = Math.round(height);
      canvasScaleRef.current =
        textureSize.width / displayCanvasRef.current.width;

      redrawDisplay();
    }, [redrawDisplay]);

    // RAF loop for smooth interaction rendering
    const startRenderLoop = useCallback(() => {
      if (rafIdRef.current) return;
      const loop = () => {
        if (needsDisplayRedrawRef.current) {
          redrawDisplay();
          needsDisplayRedrawRef.current = false;
        }
        if (interactionRef.current.isDragging) {
          rafIdRef.current = requestAnimationFrame(loop);
        } else {
          rafIdRef.current = null;
        }
      };
      rafIdRef.current = requestAnimationFrame(loop);
    }, [redrawDisplay]);

    useEffect(() => {
      const canvas = displayCanvasRef.current;
      if (!canvas) return;
      if (toolMode === "eraser-pick") {
        canvas.style.cursor = "crosshair";
      } else if (toolMode === "eraser") {
        canvas.style.cursor = "default";
      } else if (toolMode === "hand") {
        canvas.style.cursor = "grab";
      } else {
        canvas.style.cursor = "default";
      }
    }, [toolMode]);

    useEffect(() => {
      let isActive = true;
      currentMeshRef.current = null;
      if (!modelUrl) {
        resizeTextureCanvas(DEFAULT_TEXTURE_SIZE);
        resizeDisplayCanvas();
        return;
      }
      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf) => {
        if (!isActive) return;
        // Find the mesh with the best UV data (not just the first mesh)
        let bestMesh = null;
        let bestScore = -1;
        gltf.scene.traverse((child) => {
          if (!child.isMesh) return;
          const uvAttr = child.geometry?.attributes?.uv;
          if (!uvAttr || uvAttr.count === 0) return;

          // Calculate UV spread — wider spread = more useful UV layout
          let minU = Infinity,
            maxU = -Infinity,
            minV = Infinity,
            maxV = -Infinity;
          for (let i = 0; i < uvAttr.count; i++) {
            const u = uvAttr.getX(i),
              v = uvAttr.getY(i);
            minU = Math.min(minU, u);
            maxU = Math.max(maxU, u);
            minV = Math.min(minV, v);
            maxV = Math.max(maxV, v);
          }
          const uvArea = (maxU - minU) * (maxV - minV);

          // Score: UV spread area is most important, bonus for having a texture map
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          const hasMap = materials.some((m) => m?.map);
          const score =
            uvArea * 1000 + (hasMap ? 500 : 0) + uvAttr.count * 0.001;

          if (score > bestScore) {
            bestScore = score;
            bestMesh = child;
          }
        });
        // Fallback to first mesh if no UV-bearing mesh found
        if (!bestMesh) {
          gltf.scene.traverse((child) => {
            if (child.isMesh && !bestMesh) bestMesh = child;
          });
        }
        currentMeshRef.current = bestMesh;

        // Extract UV components for interaction
        const components = extractUvComponents(bestMesh, modelUrl);
        uvComponentsRef.current = components;
        setUvComponents(components);

        if (modelUrl && modelUrl.includes("Tape")) {
          const mergedGroups = {};
          const nonMerged = [];
          components.forEach((comp) => {
            if (!comp.loops || comp.loops.length === 0) return;
            const width = comp.maxU - comp.minU;
            const height = comp.maxV - comp.minV;
            if (width > height * 5) {
              const key = comp.minU.toFixed(2) + "_" + comp.maxU.toFixed(2);
              if (!mergedGroups[key]) {
                mergedGroups[key] = {
                  minU: comp.minU,
                  maxU: comp.maxU,
                  minV: comp.minV,
                  maxV: comp.maxV,
                  comps: [comp],
                };
              } else {
                mergedGroups[key].comps.push(comp);
                if (comp.minV < mergedGroups[key].minV)
                  mergedGroups[key].minV = comp.minV;
                if (comp.maxV > mergedGroups[key].maxV)
                  mergedGroups[key].maxV = comp.maxV;
                if (comp.minU < mergedGroups[key].minU)
                  mergedGroups[key].minU = comp.minU;
                if (comp.maxU > mergedGroups[key].maxU)
                  mergedGroups[key].maxU = comp.maxU;
              }
            } else {
              nonMerged.push(comp);
            }
          });
          uvTapeMergedRef.current = { mergedGroups, nonMerged };
        } else {
          uvTapeMergedRef.current = null;
        }

        const materialSize = getTextureSizeFromGltf(gltf);
        resizeTextureCanvas(
          materialSize || estimateTextureSizeFromUv(bestMesh),
        );
        resizeDisplayCanvas();
        redrawAll();
      });

      return () => {
        isActive = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelUrl]);

    useEffect(() => {
      redrawDisplay();
    }, [showUv, fullUv, selectedFace, faceColors, redrawDisplay]);

    useEffect(() => {
      bakeTexture();
    }, [bgColor, faceColors, selectedFace, bakeTexture, appliedMaterials]);

    useEffect(() => {
      window.addEventListener("resize", resizeDisplayCanvas);
      setTimeout(resizeDisplayCanvas, 100);

      return () => window.removeEventListener("resize", resizeDisplayCanvas);
    }, [resizeDisplayCanvas]);

    // When the component becomes active (visible), ensure we measure and redraw properly
    useEffect(() => {
      if (isActive) {
        // Small timeout to allow CSS transitions or display changes to settle
        setTimeout(() => {
          resizeDisplayCanvas();
          redrawDisplay();
        }, 50);
      }
    }, [isActive, resizeDisplayCanvas, redrawDisplay]);

    // --- Cursor helpers (direct DOM, no React state) ---
    const setCursor = (cursor) => {
      const canvas = displayCanvasRef.current;
      if (canvas) canvas.style.cursor = cursor;
    };

    const getCursorForHandle = (handle) => {
      switch (handle) {
        case HANDLE.MOVE:
          return "move";
        case HANDLE.ROTATE:
          return "grab";
        case HANDLE.TL:
        case HANDLE.BR:
          return "nwse-resize";
        case HANDLE.TR:
        case HANDLE.BL:
          return "nesw-resize";
        case HANDLE.T:
        case HANDLE.B:
          return "ns-resize";
        case HANDLE.L:
        case HANDLE.R:
          return "ew-resize";
        default:
          return "default";
      }
    };

    // --- Pointer handlers ---

    const handlePointerDown = (e) => {
      if (e.button === 2) return;

      if (contextMenu.open) {
        setContextMenu({ open: false, x: 0, y: 0, mode: "image" });
        contextMenuTargetRef.current = null;
      }

      const displayCanvas = displayCanvasRef.current;
      if (!displayCanvas) return;

      const rect = displayCanvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / zoom;
      const my = (e.clientY - rect.top) / zoom;
      const scale = canvasScaleRef.current;

      const interaction = interactionRef.current;

      if (toolMode === "hand" || e.button === 1) {
        interaction.isDragging = true;
        interaction.mode = HANDLE.NONE; // Specialized hand mode
        interaction.isPanning = true;
        interaction.startX = e.clientX;
        interaction.startY = e.clientY;
        interaction.startPanX = pan.x;
        interaction.startPanY = pan.y;
        setCursor("grabbing");
        displayCanvas.setPointerCapture(e.pointerId);
        return;
      }

      // If we are in eraser/eraser-pick mode, we only want to select images (or sample pixels in eraser-pick)
      // and do not want to drag, resize, rotate, or pan them.
      if (toolMode === "eraser" || toolMode === "eraser-pick") {
        let clickedImage = null;
        for (let i = imagesRef.current.length - 1; i >= 0; i--) {
          const img = imagesRef.current[i];
          if (img.contains(mx, my, scale) && !img.locked) {
            clickedImage = img;
            break;
          }
        }

        if (clickedImage) {
          selectedImageRef.current = clickedImage;
          setSelectedImage(clickedImage);
          onSelectedLayerChangeRef.current?.(clickedImage);

          if (
            toolMode === "eraser-pick" &&
            clickedImage instanceof DraggableImage
          ) {
            const sel = clickedImage;
            const { lx, ly } = sel._toLocal(mx, my, scale);
            const hw = sel.width / scale / 2;
            const hh = sel.height / scale / 2;

            if (lx >= -hw && lx <= hw && ly >= -hh && ly <= hh) {
              const imgX = Math.floor(
                ((lx + hw) / (sel.width / scale)) * sel.img.width,
              );
              const imgY = Math.floor(
                ((ly + hh) / (sel.height / scale)) * sel.img.height,
              );

              const sourceCanvas =
                sel.filteredCanvas ||
                (() => {
                  const c = document.createElement("canvas");
                  c.width = sel.img.width;
                  c.height = sel.img.height;
                  const ctx = c.getContext("2d", { willReadFrequently: true });
                  ctx.drawImage(sel.img, 0, 0);
                  return c;
                })();

              const ctx = sourceCanvas.getContext("2d", {
                willReadFrequently: true,
              });
              const pixel = ctx.getImageData(imgX, imgY, 1, 1).data;

              if (pixel[3] > 0) {
                setEraserTargetColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
                setToolMode("eraser");
              }
            }
          }
        } else {
          // Check if we clicked a face to select
          const u = mx / displayCanvas.width;
          const v = my / displayCanvas.height;
          let clickedFace = null;
          let clickedUv = null;
          for (const comp of uvComponentsRef.current) {
            if (pointInPolygon({ u, v }, comp.path)) {
              clickedFace = comp.id;
              clickedUv = { u, v };
              break;
            }
          }
          if (clickedFace !== null) {
            setSelectedFace(clickedFace);
            setSelectedFaceUv(clickedUv);
            selectedImageRef.current = null;
            setSelectedImage(null);
            onSelectedLayerChangeRef.current?.(null);
          }
        }
        redrawDisplay();
        return;
      }

      // First, check if we hit any handle on the currently selected image
      const sel = selectedImageRef.current;
      if (sel) {
        const handle = sel.hitTest(mx, my, scale);
        if (handle !== HANDLE.NONE) {
          interaction.isDragging = true;
          interaction.mode = handle;
          interaction.startMx = mx;
          interaction.startMy = my;
          interaction.startImgX = sel.x;
          interaction.startImgY = sel.y;
          interaction.startImgW = sel.width;
          interaction.startImgH = sel.height;
          interaction.aspectRatio = sel.width / sel.height;

          if (handle === HANDLE.ROTATE) {
            const cx = (sel.x + sel.width / 2) / scale;
            const cy = (sel.y + sel.height / 2) / scale;
            interaction.startAngle = Math.atan2(my - cy, mx - cx);
            interaction.startRotation = sel.rotation;
            setCursor("grabbing");
          } else {
            setCursor(getCursorForHandle(handle));
          }

          displayCanvas.setPointerCapture(e.pointerId);
          startRenderLoop();
          return;
        }
      }

      // Check if we clicked on any image body
      let clickedImage = null;
      for (let i = imagesRef.current.length - 1; i >= 0; i--) {
        const img = imagesRef.current[i];
        if (img.contains(mx, my, scale) && !img.locked) {
          clickedImage = img;
          break;
        }
      }

      if (clickedImage) {
        selectedImageRef.current = clickedImage;
        setSelectedImage(clickedImage);
        onSelectedLayerChangeRef.current?.(clickedImage);

        interaction.isDragging = true;
        interaction.mode = HANDLE.MOVE;
        interaction.startMx = mx;
        interaction.startMy = my;
        interaction.startImgX = clickedImage.x;
        interaction.startImgY = clickedImage.y;
        setCursor("move");
        displayCanvas.setPointerCapture(e.pointerId);
        startRenderLoop();

        // Also check if we should select/toggle the UV face underneath
        const u = mx / displayCanvas.width;
        const v = my / displayCanvas.height;
        let clickedFace = null;
        let clickedUv = null;
        for (const comp of uvComponentsRef.current) {
          if (pointInPolygon({ u, v }, comp.path)) {
            clickedFace = comp.id;
            clickedUv = { u, v };
            break;
          }
        }

        const getFacesToSelect = (clickedFaceId) => {
          if (
            modelUrl &&
            modelUrl.includes("Tape") &&
            uvTapeMergedRef.current
          ) {
            // Find which group contains this face
            const groups = Object.values(uvTapeMergedRef.current.mergedGroups);
            for (const group of groups) {
              if (group.comps.some((c) => c.id === clickedFaceId)) {
                return group.comps.map((c) => c.id);
              }
            }
          }
          return [clickedFaceId];
        };

        if (clickedFace) {
          const facesToToggle = getFacesToSelect(clickedFace);

          if (toolMode === "multiselect") {
            const nextFaces = new Set(selectedFacesRef.current);
            if (nextFaces.has(clickedFace)) {
              facesToToggle.forEach((fid) => nextFaces.delete(fid));
              if (selectedFace === clickedFace) {
                if (nextFaces.size > 0) {
                  const iter = nextFaces.values();
                  const firstFace = iter.next().value;
                  setSelectedFace(firstFace);
                  const comp = uvComponentsRef.current.find(
                    (c) => c.id === firstFace,
                  );
                  if (comp) {
                    setSelectedFaceUv({
                      u: (comp.minU + comp.maxU) / 2,
                      v: (comp.minV + comp.maxV) / 2,
                    });
                  } else {
                    setSelectedFaceUv(null);
                  }
                } else {
                  setSelectedFace(null);
                  setSelectedFaceUv(null);
                }
              }
            } else {
              facesToToggle.forEach((fid) => nextFaces.add(fid));
              setSelectedFace(clickedFace);
              setSelectedFaceUv(clickedUv);
            }
            setSelectedFaces(nextFaces);
          } else {
            // Normal cursor mode: select it if not already selected
            if (!selectedFacesRef.current.has(clickedFace)) {
              const nextFaces = new Set(facesToToggle);
              setSelectedFaces(nextFaces);
              setSelectedFace(clickedFace);
              setSelectedFaceUv(clickedUv);
            }
          }
        }
      } else {
        // Check for UV face click
        const u = mx / displayCanvas.width;
        const v = my / displayCanvas.height;
        let clickedFace = null;
        let clickedUv = null;
        for (const comp of uvComponentsRef.current) {
          if (pointInPolygon({ u, v }, comp.path)) {
            clickedFace = comp.id;
            clickedUv = { u, v };
            break;
          }
        }

        const getFacesToSelect = (clickedFaceId) => {
          if (
            modelUrl &&
            modelUrl.includes("Tape") &&
            uvTapeMergedRef.current
          ) {
            const groups = Object.values(uvTapeMergedRef.current.mergedGroups);
            for (const group of groups) {
              if (group.comps.some((c) => c.id === clickedFaceId)) {
                return group.comps.map((c) => c.id);
              }
            }
          }
          return [clickedFaceId];
        };

        if (clickedFace) {
          const facesToToggle = getFacesToSelect(clickedFace);

          // Keep current image selection when selecting a UV face!
          if (toolMode === "multiselect") {
            const nextFaces = new Set(selectedFacesRef.current);
            if (nextFaces.has(clickedFace)) {
              facesToToggle.forEach((fid) => nextFaces.delete(fid));
              if (selectedFace === clickedFace) {
                if (nextFaces.size > 0) {
                  // Pick the first remaining face as the anchor
                  const iter = nextFaces.values();
                  const firstFace = iter.next().value;
                  setSelectedFace(firstFace);
                  const comp = uvComponentsRef.current.find(
                    (c) => c.id === firstFace,
                  );
                  if (comp) {
                    setSelectedFaceUv({
                      u: (comp.minU + comp.maxU) / 2,
                      v: (comp.minV + comp.maxV) / 2,
                    });
                  } else {
                    setSelectedFaceUv(null);
                  }
                } else {
                  setSelectedFace(null);
                  setSelectedFaceUv(null);
                }
              }
            } else {
              facesToToggle.forEach((fid) => nextFaces.add(fid));
              setSelectedFace(clickedFace);
              setSelectedFaceUv(clickedUv);
            }
            setSelectedFaces(nextFaces);
          } else {
            const nextFaces = new Set(facesToToggle);
            setSelectedFaces(nextFaces);
            setSelectedFace(clickedFace);
            setSelectedFaceUv(clickedUv);
          }
        } else {
          // Clicked outside both an image and any UV face (blank background): clear all
          setSelectedFaces(new Set());
          setSelectedFace(null);
          setSelectedFaceUv(null);
          selectedImageRef.current = null;
          setSelectedImage(null);
          onSelectedLayerChangeRef.current?.(null);
        }
      }

      redrawDisplay();
    };

    const handlePointerMove = (e) => {
      const interaction = interactionRef.current;
      if (!interaction.isDragging) return;

      if (interaction.isPanning) {
        const dx = e.clientX - interaction.startX;
        const dy = e.clientY - interaction.startY;
        let newX = interaction.startPanX + dx;
        let newY = interaction.startPanY + dy;

        if (containerRef.current && displayCanvasRef.current) {
          const cW = containerRef.current.clientWidth;
          const cH = containerRef.current.clientHeight;
          const canvasW = displayCanvasRef.current.clientWidth * zoom;
          const canvasH = displayCanvasRef.current.clientHeight * zoom;

          // Ensure at least 100px of the canvas is always visible on screen
          const maxPanX = Math.max(0, (cW + canvasW) / 2 - 100);
          const maxPanY = Math.max(0, (cH + canvasH) / 2 - 100);

          newX = Math.max(-maxPanX, Math.min(maxPanX, newX));
          newY = Math.max(-maxPanY, Math.min(maxPanY, newY));
        }

        setPan({ x: newX, y: newY });
        return;
      }

      const displayCanvas = displayCanvasRef.current;
      if (!displayCanvas) return;

      const rect = displayCanvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / zoom;
      const my = (e.clientY - rect.top) / zoom;
      const scale = canvasScaleRef.current;

      if (toolMode === "eraser" || toolMode === "eraser-pick") {
        if (toolMode === "eraser-pick") {
          setCursor("crosshair");
        } else {
          setCursor("default");
        }
        return;
      }

      // --- Dragging ---
      const img = selectedImageRef.current;
      if (!img) return;

      const mode = interaction.mode;
      const dx = mx - interaction.startMx;
      const dy = my - interaction.startMy;

      if (mode === HANDLE.MOVE) {
        if (dx !== 0 || dy !== 0) {
          img.fitType = null;
          img.selectedFaceIds = [];
        }
        const newX = interaction.startImgX + dx * scale;
        const newY = interaction.startImgY + dy * scale;
        const texW = textureSizeRef.current.width;
        const texH = textureSizeRef.current.height;

        // Ensure at least 20 pixels (or half the image, whichever is smaller) remains visible
        const marginX = Math.min(20, img.width / 2);
        const marginY = Math.min(20, img.height / 2);

        img.x = Math.max(-img.width + marginX, Math.min(texW - marginX, newX));
        img.y = Math.max(-img.height + marginY, Math.min(texH - marginY, newY));
      } else if (mode === HANDLE.ROTATE) {
        const cx = (img.x + img.width / 2) / scale;
        const cy = (img.y + img.height / 2) / scale;
        const currentAngle = Math.atan2(my - cy, mx - cx);
        const newRot =
          interaction.startRotation + (currentAngle - interaction.startAngle);
        if (newRot !== img.rotation) {
          img.fitType = null;
          img.selectedFaceIds = [];
        }
        img.rotation = newRot;
      } else {
        // Resize handles
        img.fitType = null;
        img.selectedFaceIds = [];
        applyResize(img, mode, mx, my, scale, interaction);
      }

      needsDisplayRedrawRef.current = true;
      scheduleBake();
    };

    // Resize logic: handles both corner (proportional) and edge (non-proportional) resizing
    const applyResize = (img, mode, mx, my, scale, interaction) => {
      const startCx =
        (interaction.startImgX + interaction.startImgW / 2) / scale;
      const startCy =
        (interaction.startImgY + interaction.startImgH / 2) / scale;

      const dx = mx - startCx;
      const dy = my - startCy;
      const cos = Math.cos(-img.rotation);
      const sin = Math.sin(-img.rotation);
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;

      const startLocalW = interaction.startImgW / scale;
      const startLocalH = interaction.startImgH / scale;

      let newLeft = -startLocalW / 2;
      let newRight = startLocalW / 2;
      let newTop = -startLocalH / 2;
      let newBottom = startLocalH / 2;

      const MIN_SIZE = 20 / scale;

      if (mode >= HANDLE.TL && mode <= HANDLE.BL) {
        // Corner resize — proportional, anchored to opposite corner
        let ax, ay, vx, vy;
        if (mode === HANDLE.TL) {
          ax = startLocalW / 2;
          ay = startLocalH / 2;
          vx = -startLocalW;
          vy = -startLocalH;
        } else if (mode === HANDLE.TR) {
          ax = -startLocalW / 2;
          ay = startLocalH / 2;
          vx = startLocalW;
          vy = -startLocalH;
        } else if (mode === HANDLE.BR) {
          ax = -startLocalW / 2;
          ay = -startLocalH / 2;
          vx = startLocalW;
          vy = startLocalH;
        } else if (mode === HANDLE.BL) {
          ax = startLocalW / 2;
          ay = -startLocalH / 2;
          vx = -startLocalW;
          vy = startLocalH;
        }

        const mx_vec = lx - ax;
        const my_vec = ly - ay;

        const dot = mx_vec * vx + my_vec * vy;
        const lenSq = vx * vx + vy * vy;
        let s = dot / lenSq;

        s = Math.max(s, MIN_SIZE / Math.min(startLocalW, startLocalH));

        newLeft = ax + Math.min(vx * s, 0);
        newRight = ax + Math.max(vx * s, 0);
        newTop = ay + Math.min(vy * s, 0);
        newBottom = ay + Math.max(vy * s, 0);
      } else {
        // Edge resize — non-proportional, anchored to opposite edge
        if (mode === HANDLE.L) newLeft = Math.min(lx, newRight - MIN_SIZE);
        if (mode === HANDLE.R) newRight = Math.max(lx, newLeft + MIN_SIZE);
        if (mode === HANDLE.T) newTop = Math.min(ly, newBottom - MIN_SIZE);
        if (mode === HANDLE.B) newBottom = Math.max(ly, newTop + MIN_SIZE);
      }

      const newLocalCx = (newLeft + newRight) / 2;
      const newLocalCy = (newTop + newBottom) / 2;

      const invCos = Math.cos(img.rotation);
      const invSin = Math.sin(img.rotation);

      const newGlobalCx = startCx + (newLocalCx * invCos - newLocalCy * invSin);
      const newGlobalCy = startCy + (newLocalCx * invSin + newLocalCy * invCos);

      img.width = (newRight - newLeft) * scale;
      img.height = (newBottom - newTop) * scale;
      img.x = newGlobalCx * scale - img.width / 2;
      img.y = newGlobalCy * scale - img.height / 2;
    };

    const handlePointerUp = (e) => {
      const interaction = interactionRef.current;
      if (!interaction.isDragging) return;

      if (interaction.isPanning) {
        interaction.isPanning = false;
        setCursor(toolMode === "hand" ? "grab" : "default");
      } else {
        // End of an image interaction, save state
        if (interaction.mode !== HANDLE.NONE) {
          saveState();
          const img = selectedImageRef.current;
          if (img) {
            onSelectedLayerChangeRef.current?.({ ...img });
          }
        }
      }

      interaction.isDragging = false;
      interaction.mode = HANDLE.NONE;
      // Final bake
      bakeTexture();
      redrawDisplay();
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      const displayCanvas = displayCanvasRef.current;
      if (!displayCanvas) return;

      const rect = displayCanvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / zoom;
      const my = (e.clientY - rect.top) / zoom;

      const scale = canvasScaleRef.current;
      let clickedImage = null;
      for (let i = imagesRef.current.length - 1; i >= 0; i--) {
        if (imagesRef.current[i].contains(mx, my, scale)) {
          clickedImage = imagesRef.current[i];
          break;
        }
      }

      if (clickedImage) {
        selectedImageRef.current = clickedImage;
        setSelectedImage(clickedImage);

        const containerRect = containerRef.current.getBoundingClientRect();
        setContextMenu({
          open: true,
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top,
          mode: "image",
        });
      } else {
        const containerRect = containerRef.current.getBoundingClientRect();
        setContextMenu({
          open: true,
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top,
          mode: "canvas",
        });
      }
    };

    const onDuplicate = () => {
      const sel = selectedImageRef.current;
      if (!sel) return;
      const copy = sel.clone();
      copy.x = sel.x;
      copy.y = sel.y + 120;
      imagesRef.current.push(copy);
      setSelectedImage(copy);
      selectedImageRef.current = copy;
      needsDisplayRedrawRef.current = true;
      bakeTexture();
      saveState();
      redrawDisplay();
      setContextMenu({ ...contextMenu, open: false });
    };

    const onDelete = () => {
      const sel = selectedImageRef.current;
      if (!sel) return;
      imagesRef.current = imagesRef.current.filter((img) => img !== sel);
      setSelectedImage(null);
      selectedImageRef.current = null;
      needsDisplayRedrawRef.current = true;
      bakeTexture();
      saveState();
      redrawDisplay();
      setContextMenu({ ...contextMenu, open: false });
    };

    const onBringForward = () => {
      const sel = selectedImageRef.current;
      if (!sel) return;
      const arr = imagesRef.current;
      const idx = arr.indexOf(sel);
      if (idx < arr.length - 1) {
        arr.splice(idx, 1);
        arr.splice(idx + 1, 0, sel);
        needsDisplayRedrawRef.current = true;
        bakeTexture();
        saveState();
        redrawDisplay();
      }
    };

    const onSendBackward = () => {
      const sel = selectedImageRef.current;
      if (!sel) return;
      const arr = imagesRef.current;
      const idx = arr.indexOf(sel);
      if (idx > 0) {
        arr.splice(idx, 1);
        arr.splice(idx - 1, 0, sel);
        needsDisplayRedrawRef.current = true;
        bakeTexture();
        saveState();
        redrawDisplay();
      }
    };

    const onBringToFront = () => {
      const sel = selectedImageRef.current;
      if (!sel) return;
      const arr = imagesRef.current;
      const idx = arr.indexOf(sel);
      if (idx < arr.length - 1) {
        arr.splice(idx, 1);
        arr.push(sel);
        needsDisplayRedrawRef.current = true;
        bakeTexture();
        saveState();
        redrawDisplay();
      }
      setContextMenu({ ...contextMenu, open: false });
    };

    const onBringToBack = () => {
      const sel = selectedImageRef.current;
      if (!sel) return;
      const arr = imagesRef.current;
      const idx = arr.indexOf(sel);
      if (idx > 0) {
        arr.splice(idx, 1);
        arr.unshift(sel);
        needsDisplayRedrawRef.current = true;
        bakeTexture();
        saveState();
        redrawDisplay();
      }
      setContextMenu({ ...contextMenu, open: false });
    };

    function onUploadImage(fileOrUrl, fitType = null) {
      if (!fileOrUrl) return;
      const url =
        typeof fileOrUrl === "string"
          ? fileOrUrl
          : URL.createObjectURL(fileOrUrl);
      const img = new Image();
      img.onload = () => {
        const newImg = new DraggableImage(img, textureSizeRef.current);

        let minU = Infinity,
          maxU = -Infinity,
          minV = Infinity,
          maxV = -Infinity;
        let hasSelected = false;

        uvComponentsRef.current.forEach((comp) => {
          if (selectedFacesRef.current.has(comp.id)) {
            minU = Math.min(minU, comp.minU);
            maxU = Math.max(maxU, comp.maxU);
            minV = Math.min(minV, comp.minV);
            maxV = Math.max(maxV, comp.maxV);
            hasSelected = true;
          }
        });

        if (hasSelected && fitType) {
          const widthInTex = (maxU - minU) * textureSizeRef.current.width;
          const heightInTex = (maxV - minV) * textureSizeRef.current.height;
          const centerXInTex =
            ((minU + maxU) / 2) * textureSizeRef.current.width;
          const centerYInTex =
            ((minV + maxV) / 2) * textureSizeRef.current.height;

          let imgWidth, imgHeight;
          if (fitType === "cover") {
            imgWidth = widthInTex;
            imgHeight = heightInTex;
          } else if (fitType === "fit-short-edge") {
            const imgW = img.naturalWidth || img.width || 300;
            const imgH = img.naturalHeight || img.height || 300;
            const imgAspect = imgW / imgH;
            if (widthInTex < heightInTex) {
              imgWidth = widthInTex;
              imgHeight = widthInTex / imgAspect;
            } else {
              imgHeight = heightInTex;
              imgWidth = heightInTex * imgAspect;
            }
          } else if (fitType === "contain") {
            const boxAspect = widthInTex / heightInTex;
            const imgW = img.naturalWidth || img.width || 300;
            const imgH = img.naturalHeight || img.height || 300;
            const imgAspect = imgW / imgH;
            if (imgAspect > boxAspect) {
              imgWidth = widthInTex;
              imgHeight = widthInTex / imgAspect;
            } else {
              imgHeight = heightInTex;
              imgWidth = heightInTex * imgAspect;
            }
          }

          newImg.width = imgWidth;
          newImg.height = imgHeight;
          newImg.x = centerXInTex - imgWidth / 2;
          newImg.y = centerYInTex - imgHeight / 2;
        }

        if (hasSelected) {
          newImg.selectedFaceIds = Array.from(selectedFacesRef.current);
          newImg.fitType = fitType;
        }
        imagesRef.current.push(newImg);
        selectedImageRef.current = newImg;
        setSelectedImage(newImg);
        onSelectedLayerChangeRef.current?.(newImg);
        needsDisplayRedrawRef.current = true;
        bakeTexture();
        saveState();
        redrawDisplay();
      };
      img.src = url;
    }

    useImperativeHandle(ref, () => ({
      hasSelectedFace: () => {
        return selectedFacesRef.current.size > 0;
      },
      hasSelectedImage: () => {
        return !!selectedImageRef.current;
      },
      uploadImage: (file, fitType = null) => {
        onUploadImage(file, fitType);
      },
      alignSelectedLayer: (hAlign, vAlign) => {
        const sel = selectedImageRef.current;
        if (!sel) return;

        let minU = 0,
          maxU = 1,
          minV = 0,
          maxV = 1;
        let hasSelected = false;

        uvComponentsRef.current.forEach((comp) => {
          if (selectedFacesRef.current.has(comp.id)) {
            if (!hasSelected) {
              minU = comp.minU;
              maxU = comp.maxU;
              minV = comp.minV;
              maxV = comp.maxV;
            } else {
              minU = Math.min(minU, comp.minU);
              maxU = Math.max(maxU, comp.maxU);
              minV = Math.min(minV, comp.minV);
              maxV = Math.max(maxV, comp.maxV);
            }
            hasSelected = true;
          }
        });

        const texW = textureSizeRef.current.width;
        const texH = textureSizeRef.current.height;

        const boundsX = minU * texW;
        const boundsY = minV * texH;
        const boundsW = (maxU - minU) * texW;
        const boundsH = (maxV - minV) * texH;

        if (hAlign) {
          if (hAlign === "left") sel.x = boundsX;
          else if (hAlign === "center")
            sel.x = boundsX + boundsW / 2 - sel.width / 2;
          else if (hAlign === "right") sel.x = boundsX + boundsW - sel.width;
        }

        if (vAlign) {
          if (vAlign === "top") sel.y = boundsY;
          else if (vAlign === "center")
            sel.y = boundsY + boundsH / 2 - sel.height / 2;
          else if (vAlign === "bottom") sel.y = boundsY + boundsH - sel.height;
        }

        needsDisplayRedrawRef.current = true;
        bakeTexture();
        saveState();
        redrawDisplay();
      },
      applyFitToSelectedImage: (fitType) => {
        const sel = selectedImageRef.current;
        if (!sel || !sel.img) return;

        let minU = Infinity,
          maxU = -Infinity,
          minV = Infinity,
          maxV = -Infinity;
        let hasSelected = false;

        uvComponentsRef.current.forEach((comp) => {
          if (selectedFacesRef.current.has(comp.id)) {
            minU = Math.min(minU, comp.minU);
            maxU = Math.max(maxU, comp.maxU);
            minV = Math.min(minV, comp.minV);
            maxV = Math.max(maxV, comp.maxV);
            hasSelected = true;
          }
        });

        if (hasSelected && fitType) {
          const widthInTex = (maxU - minU) * textureSizeRef.current.width;
          const heightInTex = (maxV - minV) * textureSizeRef.current.height;
          const centerXInTex =
            ((minU + maxU) / 2) * textureSizeRef.current.width;
          const centerYInTex =
            ((minV + maxV) / 2) * textureSizeRef.current.height;

          const img = sel.img;
          let imgWidth, imgHeight;
          if (fitType === "cover") {
            imgWidth = widthInTex;
            imgHeight = heightInTex;
          } else if (fitType === "contain") {
            const boxAspect = widthInTex / heightInTex;
            const imgW = img.naturalWidth || img.width || 300;
            const imgH = img.naturalHeight || img.height || 300;
            const imgAspect = imgW / imgH;
            if (imgAspect > boxAspect) {
              imgWidth = widthInTex;
              imgHeight = widthInTex / imgAspect;
            } else {
              imgHeight = heightInTex;
              imgWidth = heightInTex * imgAspect;
            }
          }

          sel.width = imgWidth;
          sel.height = imgHeight;
          sel.x = centerXInTex - imgWidth / 2;
          sel.y = centerYInTex - imgHeight / 2;
          sel.rotation = 0;
          sel.selectedFaceIds = Array.from(selectedFacesRef.current);
          sel.fitType = fitType;

          needsDisplayRedrawRef.current = true;
          bakeTexture();
          saveState();
          redrawDisplay();
        }
      },
      addText: (text = "Text") => {
        const dt = new DraggableText(text, textureSizeRef.current);
        imagesRef.current.push(dt);
        selectedImageRef.current = dt;
        setSelectedImage(dt);
        needsDisplayRedrawRef.current = true;
        bakeTexture();
        saveState();
        redrawDisplay();
        onSelectedLayerChangeRef.current?.(dt);
      },
      updateSelectedTextProps: (props) => {
        const sel = selectedImageRef.current;
        if (!sel || !(sel instanceof DraggableText)) return;
        Object.assign(sel, props);
        if (
          props.text !== undefined ||
          props.fontSize !== undefined ||
          props.fontFamily !== undefined ||
          props.bold !== undefined ||
          props.italic !== undefined ||
          props.underline !== undefined
        ) {
          sel.updateDimensions();
        }
        needsDisplayRedrawRef.current = true;
        bakeTexture();
        redrawDisplay();
      },
      getSelectedLayer: () => selectedImageRef.current,
      getCleanTexture: () => {
        setSelectedFace(null);
        bakeTexture(true); // Bake synchronously without selection highlight
        return textureCanvasRef.current.toDataURL("image/png");
      },
      exportAsPNG: () => {
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = textureSizeRef.current.width;
        exportCanvas.height = textureSizeRef.current.height;
        const ctx = exportCanvas.getContext("2d");
        imagesRef.current.forEach((item) => {
          ctx.save();
          ctx.globalAlpha = item.opacity;
          ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
          ctx.rotate(item.rotation);
          ctx.scale(item.flipX ? -1 : 1, item.flipY ? -1 : 1);
          if (item instanceof DraggableText) {
            const scaleX = item.width / item.nativeWidth;
            const scaleY = item.height / item.nativeHeight;
            ctx.scale(scaleX, scaleY);

            ctx.fillStyle = item.color;
            ctx.font = `${item.italic ? "italic " : ""}${item.bold ? "bold " : ""}${item.fontSize}px ${item.fontFamily}`;
            const lines = item.text.split("\n");
            const lineHeight = item.fontSize * 1.3;
            const startY = (-(lines.length - 1) * lineHeight) / 2;

            lines.forEach((line, i) => {
              const lineY = startY + i * lineHeight;
              ctx.fillText(line, 0, lineY);

              if (item.underline) {
                const metrics = ctx.measureText(line);
                const textWidth = metrics.width;
                const underlineY = lineY + item.fontSize * 0.4;
                const thickness = Math.max(1, item.fontSize / 15);

                ctx.beginPath();
                ctx.strokeStyle = item.color;
                ctx.lineWidth = thickness;
                ctx.moveTo(-textWidth / 2, underlineY);
                ctx.lineTo(textWidth / 2, underlineY);
                ctx.stroke();
              }
            });
          } else {
            ctx.drawImage(
              item.img,
              -item.width / 2,
              -item.height / 2,
              item.width,
              item.height,
            );
          }
          ctx.restore();
        });
        return exportCanvas.toDataURL("image/png");
      },
      exportAsSVG: () => {
        const width = textureSizeRef.current.width;
        const height = textureSizeRef.current.height;
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

        svg += `\n  <g id="Background"><rect width="100%" height="100%" fill="#ffffff" /></g>`;

        if (showUv && currentMeshRef.current) {
          svg += `\n  <g id="UV_Frame">\n`;
          const mesh = currentMeshRef.current;
          const components = uvComponentsRef.current;
          const shouldDrawFull =
            fullUv || !components || components.length === 0;
          const geometry = mesh.geometry;

          if (geometry && geometry.attributes.uv) {
            const uvAttr = geometry.attributes.uv;
            const index = geometry.index;
            let d = "";

            if (shouldDrawFull) {
              const addLine = (idx1, idx2) => {
                const u1 = uvAttr.getX(idx1);
                const v1 = uvAttr.getY(idx1);
                const u2 = uvAttr.getX(idx2);
                const v2 = uvAttr.getY(idx2);
                d += `M${(u1 * width).toFixed(2)} ${(v1 * height).toFixed(2)} L${(u2 * width).toFixed(2)} ${(v2 * height).toFixed(2)} `;
              };

              if (index) {
                for (let i = 0; i < index.count; i += 3) {
                  const a = index.getX(i);
                  const b = index.getX(i + 1);
                  const c = index.getX(i + 2);
                  addLine(a, b);
                  addLine(b, c);
                  addLine(c, a);
                }
              } else {
                for (let i = 0; i < uvAttr.count; i += 3) {
                  addLine(i, i + 1);
                  addLine(i + 1, i + 2);
                  addLine(i + 2, i);
                }
              }
              svg += `    <path d="${d}" fill="none" stroke="#9ca3af" stroke-width="1" />\n`;
            } else {
              components.forEach((comp) => {
                if (!comp.loops || comp.loops.length === 0) return;
                let pathD = "";
                comp.loops.forEach((loop) => {
                  if (loop.length === 0) return;
                  pathD += `M${(loop[0].u * width).toFixed(2)} ${(loop[0].v * height).toFixed(2)} `;
                  for (let i = 1; i < loop.length; i++) {
                    pathD += `L${(loop[i].u * width).toFixed(2)} ${(loop[i].v * height).toFixed(2)} `;
                  }
                  pathD += "Z ";
                });
                svg += `    <path d="${pathD.trim()}" fill="none" stroke="#9ca3af" stroke-width="1" />\n`;
              });
            }
          }
          svg += `  </g>`;
        }

        imagesRef.current.forEach((item, index) => {
          const layerId = `Layer_${index + 1}`;
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = width;
          tempCanvas.height = height;
          const ctx = tempCanvas.getContext("2d");

          ctx.save();
          ctx.globalAlpha = item.opacity;
          ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
          ctx.rotate(item.rotation);
          ctx.scale(item.flipX ? -1 : 1, item.flipY ? -1 : 1);

          if (item instanceof DraggableText) {
            const scaleX = item.width / item.nativeWidth;
            const scaleY = item.height / item.nativeHeight;
            ctx.scale(scaleX, scaleY);
            ctx.fillStyle = item.color;
            ctx.font = `${item.italic ? "italic " : ""}${item.bold ? "bold " : ""}${item.fontSize}px ${item.fontFamily}`;
            const lines = item.text.split("\n");
            const lineHeight = item.fontSize * 1.3;
            const startY = (-(lines.length - 1) * lineHeight) / 2;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            lines.forEach((line, i) => {
              const lineY = startY + i * lineHeight;
              ctx.fillText(line, 0, lineY);
              if (item.underline) {
                const metrics = ctx.measureText(line);
                const textWidth = metrics.width;
                const underlineY = lineY + item.fontSize * 0.4;
                const thickness = Math.max(1, item.fontSize / 15);
                ctx.beginPath();
                ctx.strokeStyle = item.color;
                ctx.lineWidth = thickness;
                ctx.moveTo(-textWidth / 2, underlineY);
                ctx.lineTo(textWidth / 2, underlineY);
                ctx.stroke();
              }
            });
          } else {
            ctx.drawImage(
              item.img,
              -item.width / 2,
              -item.height / 2,
              item.width,
              item.height,
            );
          }
          ctx.restore();

          const base64 = tempCanvas.toDataURL("image/png");
          svg += `\n  <g id="${layerId}">\n    <image xlink:href="${base64}" href="${base64}" x="0" y="0" width="${width}" height="${height}" />\n  </g>`;
        });

        svg += `\n</svg>`;
        return svg;
      },
      exportAsPDF: async () => {
        const { jsPDF } = await import("jspdf");
        const width = textureSizeRef.current.width;
        const height = textureSizeRef.current.height;
        const pdf = new jsPDF({
          orientation: width > height ? "landscape" : "portrait",
          unit: "px",
          format: [width, height],
        });

        if (showUv && currentMeshRef.current) {
          const uvCanvas = document.createElement("canvas");
          uvCanvas.width = width;
          uvCanvas.height = height;
          const uvCtx = uvCanvas.getContext("2d");
          drawUVs(
            currentMeshRef.current,
            uvComponentsRef.current,
            {},
            new Set(),
            uvCtx,
            width,
            height,
            fullUv,
            modelUrl,
            uvTapeMergedRef.current,
          );
          const uvBase64 = uvCanvas.toDataURL("image/png");
          pdf.addImage(uvBase64, "PNG", 0, 0, width, height);
        }

        imagesRef.current.forEach((item, index) => {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = width;
          tempCanvas.height = height;
          const ctx = tempCanvas.getContext("2d");

          ctx.save();
          ctx.globalAlpha = item.opacity;
          ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
          ctx.rotate(item.rotation);
          ctx.scale(item.flipX ? -1 : 1, item.flipY ? -1 : 1);

          if (item instanceof DraggableText) {
            const scaleX = item.width / item.nativeWidth;
            const scaleY = item.height / item.nativeHeight;
            ctx.scale(scaleX, scaleY);
            ctx.fillStyle = item.color;
            ctx.font = `${item.italic ? "italic " : ""}${item.bold ? "bold " : ""}${item.fontSize}px ${item.fontFamily}`;
            const lines = item.text.split("\n");
            const lineHeight = item.fontSize * 1.3;
            const startY = (-(lines.length - 1) * lineHeight) / 2;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            lines.forEach((line, i) => {
              const lineY = startY + i * lineHeight;
              ctx.fillText(line, 0, lineY);
              if (item.underline) {
                const metrics = ctx.measureText(line);
                const textWidth = metrics.width;
                const underlineY = lineY + item.fontSize * 0.4;
                const thickness = Math.max(1, item.fontSize / 15);
                ctx.beginPath();
                ctx.strokeStyle = item.color;
                ctx.lineWidth = thickness;
                ctx.moveTo(-textWidth / 2, underlineY);
                ctx.lineTo(textWidth / 2, underlineY);
                ctx.stroke();
              }
            });
          } else {
            ctx.drawImage(
              item.img,
              -item.width / 2,
              -item.height / 2,
              item.width,
              item.height,
            );
          }
          ctx.restore();

          const base64 = tempCanvas.toDataURL("image/png");
          if (index > 0) {
            // pdf.addPage(); // Use this if we want actual pages, but layered usually means on same page
            // wait, user said layered. Multiple overlapping objects on the same page is best.
          }
          pdf.addImage(base64, "PNG", 0, 0, width, height);
        });

        return pdf.output("bloburl");
      },
    }));

    const onRequestClearAll = () => {
      setContextMenu((menu) => ({ ...menu, mode: "confirm-clear" }));
    };

    const onCancelClearAll = () => {
      setContextMenu((menu) => ({ ...menu, mode: "canvas" }));
    };

    const onClearAllImages = () => {
      imagesRef.current = [];
      selectedImageRef.current = null;
      contextMenuTargetRef.current = null;
      setSelectedImage(null);
      setContextMenu({ open: false, x: 0, y: 0, mode: "image" });
      redrawAll();
    };

    const getSelectedToolbarStyle = () => {
      const sel = selectedImageRef.current;
      if (!sel || !displayCanvasRef.current || !containerRef.current) return {};

      const canvasRect = displayCanvasRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const renderScale = canvasRect.width / displayCanvasRef.current.width;
      const scale = canvasScaleRef.current;

      const imgX_unscaled = (sel.x + sel.width / 2) / scale;
      const imgY_unscaled = sel.y / scale;

      const left =
        canvasRect.left - containerRect.left + imgX_unscaled * renderScale;
      const top =
        canvasRect.top - containerRect.top + imgY_unscaled * renderScale;

      return {
        left: `${left}px`,
        top: `${top - 15}px`,
        transform: "translate(-50%, -100%)",
      };
    };

    const getSelectedFaceStyle = () => {
      const comp = uvComponentsRef.current.find((c) => c.id === selectedFace);
      if (!comp || !displayCanvasRef.current || !containerRef.current)
        return {};

      const canvasRect = displayCanvasRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const renderScale = canvasRect.width / displayCanvasRef.current.width;

      const unscaledW = displayCanvasRef.current.width;
      const unscaledH = displayCanvasRef.current.height;

      const cx_unscaled = selectedFaceUv
        ? selectedFaceUv.u * unscaledW
        : ((comp.minU + comp.maxU) / 2) * unscaledW;
      let top_unscaled = selectedFaceUv
        ? selectedFaceUv.v * unscaledH - 30 / zoom
        : comp.minV * unscaledH - 15 / zoom;

      const left =
        canvasRect.left - containerRect.left + cx_unscaled * renderScale;
      const top =
        canvasRect.top - containerRect.top + top_unscaled * renderScale;

      return {
        left: `${left}px`,
        top: `${top}px`,
        transform: "translate(-50%, -100%)",
        pointerEvents: "auto",
      };
    };
    return (
      <div
        className="flex-1 flex flex-col relative"
        style={{ background: "#f5efe6" }}
      >
        <div
          className="flex-1 relative overflow-hidden"
          ref={containerRef}
          onPointerDown={(e) => {
            // If they click the background (not the canvas itself), clear selections
            if (
              e.target === e.currentTarget ||
              e.target.id === "canvas-bg-grid" ||
              e.target.id === "canvas-wrapper"
            ) {
              setSelectedFace(null);
              setSelectedFaceUv(null);
              setSelectedFaces(new Set());
              setSelectedImage(null);
              selectedImageRef.current = null;
              if (contextMenu.open)
                setContextMenu({ ...contextMenu, open: false });
              redrawDisplay();
            }
          }}
        >
          <div
            id="canvas-bg-grid"
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.15) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div
            id="canvas-wrapper"
            className="absolute inset-0 flex items-center justify-center p-4 pb-24"
          >
            <div className="relative">
              <canvas
                ref={displayCanvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onContextMenu={handleContextMenu}
                onDoubleClick={(e) => {
                  const displayCanvas = displayCanvasRef.current;
                  if (!displayCanvas) return;
                  const rect = displayCanvas.getBoundingClientRect();
                  const mx = (e.clientX - rect.left) / zoom;
                  const my = (e.clientY - rect.top) / zoom;
                  const scale = canvasScaleRef.current;
                  const sel = selectedImageRef.current;
                  if (
                    sel instanceof DraggableText &&
                    sel.contains(mx, my, scale)
                  ) {
                    const renderScale = rect.width / displayCanvas.width;
                    const scaledX = (sel.x / scale) * renderScale + rect.left;
                    const scaledY = (sel.y / scale) * renderScale + rect.top;
                    const scaledW = (sel.width / scale) * renderScale;
                    const scaledH = (sel.height / scale) * renderScale;
                    setEditingText({
                      layer: sel,
                      x: scaledX,
                      y: scaledY,
                      w: scaledW,
                      h: scaledH,
                    });
                  }
                }}
                style={{
                  cursor:
                    toolMode === "hand"
                      ? interactionRef.current.isPanning
                        ? "grabbing"
                        : "grab"
                      : "default",
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "center",
                }}
                className="touch-none transition-transform duration-75"
              />

              {/* Inline Text Edit Overlay */}
              {editingText && (
                <div
                  style={{
                    position: "fixed",
                    left: editingText.x,
                    top: editingText.y,
                    width: Math.max(editingText.w * 1.5, 200),
                    zIndex: 9999,
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <textarea
                    autoFocus
                    defaultValue={editingText.layer.text}
                    onFocus={(e) => {
                      if (e.target.value === "Your Text") {
                        e.target.value = "";
                      } else {
                        e.target.select();
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim() || "Text";
                      editingText.layer.text = val;
                      editingText.layer.updateDimensions();
                      setEditingText(null);
                      needsDisplayRedrawRef.current = true;
                      bakeTexture();
                      saveState();
                      redrawDisplay();
                      onSelectedLayerChangeRef.current?.(editingText.layer);
                    }}
                    onKeyDown={(e) => {
                      // Shift+Enter goes to new line, Enter blurs and saves
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.target.blur();
                      }
                      if (e.key === "Escape") setEditingText(null);
                    }}
                    style={{
                      width: "100%",
                      minHeight: "60px",
                      padding: "8px",
                      fontSize: 14,
                      fontFamily: editingText.layer.fontFamily,
                      color: editingText.layer.color,
                      border: "2px solid #7c5cfc",
                      borderRadius: 6,
                      outline: "none",
                      background: "rgba(255,255,255,0.95)",
                      boxShadow: "0 2px 16px rgba(124,92,252,0.2)",
                      resize: "both",
                    }}
                  />
                </div>
              )}

              {/* Face Color Popup */}
              {selectedFace && (
                <div
                  className="absolute z-20 flex flex-col items-center justify-center gap-1.5"
                  style={getSelectedFaceStyle()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] px-3 py-2 rounded-xl border border-gray-100 flex items-center gap-2 relative">
                    {/* Small dimension label for width of this face */}
                    {(() => {
                      const comp = uvComponentsRef.current.find(
                        (c) => c.id === selectedFace,
                      );
                      if (comp) {
                        const w = Math.round((comp.maxU - comp.minU) * 1000);
                        const h = Math.round((comp.maxV - comp.minV) * 1000);
                        return (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shadow-sm">
                            &lt;--- {w} mm ---&gt;
                          </span>
                        );
                      }
                      return null;
                    })()}

                    <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">
                      Face color
                    </span>
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200 cursor-pointer hover:scale-105 transition-transform shrink-0">
                      <input
                        type="color"
                        value={faceColors[selectedFace] || "#ffffff"}
                        onInput={(e) => {
                          const val = e.target.value;
                          setFaceColors((prev) => {
                            const next = { ...prev };
                            if (selectedFaces && selectedFaces.size > 0) {
                              selectedFaces.forEach((fId) => {
                                next[fId] = val;
                              });
                            } else {
                              next[selectedFace] = val;
                            }
                            faceColorsRef.current = next;
                            return next;
                          });
                        }}
                        onChange={() => saveState()}
                        className="absolute -inset-2 w-[200%] h-[200%] p-0 border-none cursor-pointer outline-none"
                      />
                    </div>
                    {faceColors[selectedFace] && (
                      <button
                        onClick={() => {
                          const newColors = { ...faceColors };
                          if (selectedFaces && selectedFaces.size > 0) {
                            selectedFaces.forEach((fId) => {
                              delete newColors[fId];
                            });
                          } else {
                            delete newColors[selectedFace];
                          }
                          setFaceColors(newColors);
                          faceColorsRef.current = newColors;
                          saveState();
                        }}
                        title="Clear color"
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 border-none cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-3 h-3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Bottom Tool Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white shadow-[0_4px_25px_rgba(0,0,0,0.15)] rounded-full px-4 py-2.5 flex items-center gap-2 border border-gray-100">
              {/* Tools */}
              <Tooltip label="Select Tool">
                <button
                  onClick={() => setToolMode("cursor")}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${toolMode === "cursor" ? "bg-black" : "bg-transparent hover:bg-gray-50"}`}
                >
                  <img
                    src={cursorIcon}
                    alt="Cursor"
                    className={`w-6 h-6 object-contain opacity-80 hover:opacity-100 ${toolMode === "cursor" ? "invert brightness-0" : ""}`}
                  />
                </button>
              </Tooltip>
              <Tooltip label="Pan Tool">
                <button
                  onClick={() => setToolMode("hand")}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${toolMode === "hand" ? "bg-black" : "bg-transparent hover:bg-gray-50"}`}
                >
                  <img
                    src={handIcon}
                    alt="Hand"
                    className={`w-6 h-6 object-contain opacity-80 hover:opacity-100 ${toolMode === "hand" ? "invert brightness-0" : ""}`}
                  />
                </button>
              </Tooltip>
              <Tooltip label="Multi-Select Mode">
                <button
                  onClick={() => setToolMode("multiselect")}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${toolMode === "multiselect" ? "bg-black" : "bg-transparent hover:bg-gray-50"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-5 h-5 opacity-80 hover:opacity-100 ${toolMode === "multiselect" ? "text-white" : "text-gray-800"}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 3l12 8l-4.5 1.5l3.5 5.5l-1.5 1l-3.5-5.5l-2.5 2.5V3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 4h6m-3-3v6"
                    />
                  </svg>
                </button>
              </Tooltip>

              <div className="relative">
                <Tooltip label="Eraser Tool (Remove Color)">
                  <button
                    onClick={() => {
                      setToolMode("eraser");
                      setSelectedImage(null);
                      selectedImageRef.current = null;
                      onSelectedLayerChangeRef.current?.(null);
                      setEraserTargetColor(null);
                      redrawDisplay();
                    }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${toolMode === "eraser" || toolMode === "eraser-pick" ? "bg-black" : "bg-transparent hover:bg-gray-50"}`}
                  >
                    <img
                      src={erraserIcon}
                      alt="Eraser"
                      className={`w-6 h-6 opacity-80 hover:opacity-100 ${toolMode === "eraser" || toolMode === "eraser-pick" ? "brightness-0 invert" : ""}`}
                    />
                  </button>
                </Tooltip>
                {(toolMode === "eraser" || toolMode === "eraser-pick") && (
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-4 w-64 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Color Eraser
                      </span>
                    </div>

                    <div
                      onClick={() =>
                        setToolMode(
                          toolMode === "eraser-pick" ? "eraser" : "eraser-pick",
                        )
                      }
                      className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100/80 transition-colors"
                      title="Pick Color from Image"
                    >
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center transition-colors shrink-0 ${toolMode === "eraser-pick" ? "bg-indigo-100 text-indigo-600 border border-indigo-200" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m15 11.25 1.5 1.5.75-.375a1.5 1.5 0 0 1 1.5 1.5l5.25 5.25c.375.375.375.982 0 1.357-.375.375-.982.375-1.357 0l-5.25-5.25a1.5 1.5 0 0 1-1.5-1.5l.375-.75-1.5-1.5M15 11.25l-2.25-2.25M15 11.25l-2.25 2.25m-6-6 2.25-2.25m0 0L7.5 4.5m1.5 1.5L5.25 9.75M12 9l-3 3"
                          />
                        </svg>
                      </div>
                      <div className="text-xs text-gray-500 font-medium flex-1">
                        {eraserTargetColor
                          ? "Color Selected"
                          : "Click to select"}
                      </div>
                      <div
                        className="w-8 h-8 rounded border border-gray-200 shadow-sm shrink-0"
                        style={{
                          backgroundColor: eraserTargetColor
                            ? `rgb(${eraserTargetColor.r}, ${eraserTargetColor.g}, ${eraserTargetColor.b})`
                            : "transparent",
                          backgroundImage: !eraserTargetColor
                            ? "radial-gradient(#e5e7eb 1px, transparent 0)"
                            : "none",
                          backgroundSize: "4px 4px",
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Tolerance
                      </span>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        {eraserTolerance}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      value={eraserTolerance}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEraserTolerance(val);
                        // Update tolerance if already erasing
                        const img = selectedImageRef.current;
                        if (
                          img &&
                          img.erasedColors &&
                          img.erasedColors.length > 0
                        ) {
                          img.erasedColors[
                            img.erasedColors.length - 1
                          ].tolerance = val;
                          img.applyEraser();
                          redrawDisplay();
                          bakeTexture();
                        }
                      }}
                      className="w-full accent-[#c0623a] mb-4"
                    />

                    <button
                      disabled={!eraserTargetColor}
                      onClick={() => {
                        const img = selectedImageRef.current;
                        if (img && eraserTargetColor) {
                          img.removeColor(
                            eraserTargetColor.r,
                            eraserTargetColor.g,
                            eraserTargetColor.b,
                            eraserTolerance,
                          );
                          saveState();
                          redrawDisplay();
                          bakeTexture();
                        }
                      }}
                      className="w-full py-2 bg-red-50 text-red-600 font-bold text-xs rounded-lg border border-red-100 hover:bg-red-100 hover:border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      Remove Color
                    </button>
                  </div>
                )}
              </div>

              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* History */}
              <Tooltip label="Undo">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors bg-transparent ${historyIndex <= 0 ? "text-gray-300" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                    />
                  </svg>
                </button>
              </Tooltip>
              <Tooltip label="Redo">
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors bg-transparent ${historyIndex >= history.length - 1 ? "text-gray-300" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
                    />
                  </svg>
                </button>
              </Tooltip>

              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* Zoom */}
              <Tooltip label="Zoom Out">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
                  className="w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors bg-transparent text-gray-700 hover:bg-gray-50 font-bold text-xl leading-none pb-1"
                >
                  -
                </button>
              </Tooltip>
              <Tooltip label="Reset Zoom">
                <button
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="px-3 h-11 flex items-center justify-center border-none cursor-pointer transition-colors bg-transparent text-gray-800 font-bold text-sm hover:bg-gray-50 rounded-lg min-w-[60px]"
                >
                  {Math.round(zoom * 100)}%
                </button>
              </Tooltip>
              <Tooltip label="Zoom In">
                <button
                  onClick={() => setZoom((z) => Math.min(1.5, z + 0.2))}
                  className="w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors bg-transparent text-gray-700 hover:bg-gray-50 font-bold text-xl leading-none"
                >
                  +
                </button>
              </Tooltip>
            </div>

            <div className="absolute bottom-8 right-[7%] -translate-x-1/2 z-30">
              {onOpenTapeLayout && modelUrl?.includes("Tape") && (
                <>
                  <Tooltip label="Tape Layout">
                    <button
                      onClick={onOpenTapeLayout}
                      className=" px-4 h-11 rounded-full cursor-pointer bg-yellow-400 border-[2px] border-[#c0623a] text-black hover:bg-yellow-500 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center font-bold text-[14px] leading-tight text-center"
                    >
                      Tape Layout
                    </button>
                  </Tooltip>
                </>
              )}
            </div>
          </div>

          {contextMenu.open && (
            <div
              className={`absolute z-30 overflow-visible rounded-xl border shadow-xl ${contextMenu.mode === "image" ? "flex items-center gap-1 bg-white px-1.5 py-1.5 border-gray-100" : "min-w-[170px] overflow-hidden bg-white py-1 border-gray-200"}`}
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onPointerDown={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
            >
              {contextMenu.mode === "image" && (
                <>
                  {/* Layers Dropdown */}
                  <div className="relative group/menu">
                    <Tooltip label="Layers" position="top">
                      <button className="w-10 h-10 rounded-lg flex items-center justify-center border-none bg-transparent hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
                          />
                        </svg>
                      </button>
                    </Tooltip>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 hidden group-hover/menu:block">
                      <div className="bg-white shadow-xl rounded-lg border border-gray-100 min-w-[150px] py-1">
                        <ContextMenuItem onClick={onBringToFront}>
                          <div className="flex items-center gap-2">
                            <img
                              src={frontIcon}
                              className="w-4 h-4 opacity-70"
                              alt=""
                            />
                            <span>Bring to front</span>
                          </div>
                        </ContextMenuItem>
                        <ContextMenuItem onClick={onBringForward}>
                          <div className="flex items-center gap-2">
                            <img
                              src={frontIcon}
                              className="w-4 h-4 opacity-70"
                              alt=""
                            />
                            <span>Bring forward</span>
                          </div>
                        </ContextMenuItem>
                        <ContextMenuItem onClick={onSendBackward}>
                          <div className="flex items-center gap-2">
                            <img
                              src={sendIcon}
                              className="w-4 h-4 opacity-70"
                              alt=""
                            />
                            <span>Send backward</span>
                          </div>
                        </ContextMenuItem>
                        <ContextMenuItem onClick={onBringToBack}>
                          <div className="flex items-center gap-2">
                            <img
                              src={sendIcon}
                              className="w-4 h-4 opacity-70"
                              alt=""
                            />
                            <span>Send to back</span>
                          </div>
                        </ContextMenuItem>
                      </div>
                    </div>
                  </div>

                  {/* Duplicate */}
                  <Tooltip label="Duplicate" position="top">
                    <button
                      onClick={onDuplicate}
                      className="w-10 h-10 rounded-lg flex items-center justify-center border-none bg-transparent hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                        />
                      </svg>
                    </button>
                  </Tooltip>

                  {/* Delete */}
                  <Tooltip label="Delete" position="top">
                    <button
                      onClick={onDelete}
                      className="w-10 h-10 rounded-lg flex items-center justify-center border-none bg-transparent hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </Tooltip>

                  {/* More Options Dropdown */}
                  <div className="relative group/menu">
                    <Tooltip label="More" position="top">
                      <button className="w-10 h-10 rounded-lg flex items-center justify-center border-none bg-transparent hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors bg-gray-50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </button>
                    </Tooltip>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 hidden group-hover/menu:block">
                      <div className="bg-white shadow-xl rounded-lg border border-gray-100 min-w-[150px] py-1">
                        <ContextMenuItem
                          onClick={() => {
                            if (!selectedImageRef.current) return;
                            selectedImageRef.current.locked =
                              !selectedImageRef.current.locked;
                            setSelectedImage(null);
                            selectedImageRef.current = null;
                            needsDisplayRedrawRef.current = true;
                            bakeTexture();
                            saveState();
                            redrawDisplay();
                            setContextMenu({ ...contextMenu, open: false });
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={lockIcon}
                              className="w-4 h-4 opacity-70"
                              alt=""
                            />
                            <span>
                              {selectedImageRef.current?.locked
                                ? "Unlock"
                                : "Lock"}
                            </span>
                          </div>
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => {
                            if (!selectedImageRef.current) return;
                            selectedImageRef.current.opacity =
                              selectedImageRef.current.opacity === 1 ? 0.5 : 1;
                            needsDisplayRedrawRef.current = true;
                            bakeTexture();
                            saveState();
                            redrawDisplay();
                            setContextMenu({ ...contextMenu, open: false });
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={transparentIcon}
                              className="w-4 h-4 opacity-70"
                              alt=""
                            />
                            <span>Toggle Transparency</span>
                          </div>
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => {
                            if (!selectedImageRef.current) return;
                            selectedImageRef.current.flipX =
                              !selectedImageRef.current.flipX;
                            needsDisplayRedrawRef.current = true;
                            bakeTexture();
                            saveState();
                            redrawDisplay();
                            setContextMenu({ ...contextMenu, open: false });
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={flipHorizontalIcon}
                              className="w-4 h-4 opacity-70"
                              alt=""
                            />
                            <span>Flip horizontal</span>
                          </div>
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => {
                            if (!selectedImageRef.current) return;
                            selectedImageRef.current.flipY =
                              !selectedImageRef.current.flipY;
                            needsDisplayRedrawRef.current = true;
                            bakeTexture();
                            saveState();
                            redrawDisplay();
                            setContextMenu({ ...contextMenu, open: false });
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={flipVerticalIcon}
                              className="w-4 h-4 opacity-70"
                              alt=""
                            />
                            <span>Flip vertical</span>
                          </div>
                        </ContextMenuItem>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {contextMenu.mode === "canvas" && (
                <ContextMenuItem onClick={onRequestClearAll} danger>
                  Clear all images
                </ContextMenuItem>
              )}
              {contextMenu.mode === "confirm-clear" && (
                <div className="px-3 py-2">
                  <p className="m-0 mb-2 text-sm font-semibold text-gray-800">
                    Clear all images?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onClearAllImages}
                      className="flex-1 rounded-md border-none bg-red-600 px-3 py-1.5 text-sm font-semibold text-white cursor-pointer hover:bg-red-700"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={onCancelClearAll}
                      className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default Canvas;

function CtrlBtn({ title, onClick, children, danger }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded px-2.5 py-1.5 text-xs font-bold transition-colors border-none cursor-pointer ${
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function ContextMenuItem({ onClick, children, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full border-none bg-transparent px-4 py-2 text-left text-sm cursor-pointer ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-800 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function Tooltip({ label, children, position = "top" }) {
  const posClasses = {
    top: "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2",
    bottom: "top-[calc(100%+8px)] left-1/2 -translate-x-1/2",
  };
  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <div
        className={`absolute ${posClasses[position]} px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100] shadow-sm`}
      >
        {label}
        {/* Tooltip arrow */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-4 border-transparent ${position === "top" ? "top-full border-t-gray-900" : "bottom-full border-b-gray-900"}`}
        ></div>
      </div>
    </div>
  );
}
