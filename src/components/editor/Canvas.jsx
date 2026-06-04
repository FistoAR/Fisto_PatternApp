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
    return copy;
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

  draw(ctx, scale) {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    const scaledX = this.x / scale;
    const scaledY = this.y / scale;
    const scaledW = this.width / scale;
    const scaledH = this.height / scale;

    ctx.translate(scaledX + scaledW / 2, scaledY + scaledH / 2);
    ctx.rotate(this.rotation);
    ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);

    ctx.drawImage(this.img, -scaledW / 2, -scaledH / 2, scaledW, scaledH);
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

    this.updateDimensions();

    // Center initially
    this.x = (textureSize.width - this.width) / 2;
    this.y = (textureSize.height - this.height) / 2;
  }

  updateDimensions() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = `${this.italic ? "italic " : ""}${this.bold ? "bold " : ""}${this.fontSize}px ${this.fontFamily}`;
    const metrics = ctx.measureText(this.text);
    // Add some padding to make selection/dragging easier
    this.nativeWidth = Math.max(100, metrics.width + 40);
    this.nativeHeight = this.fontSize * 1.3;
    
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

  draw(ctx, scale) {
    ctx.save();
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
    ctx.fillText(this.text, 0, 0);

    if (this.underline) {
      const metrics = ctx.measureText(this.text);
      const textWidth = metrics.width;
      // Position underline just below the text baseline
      const underlineY = (this.fontSize / scale) * 0.4;
      const thickness = Math.max(1, (this.fontSize / scale) / 15);
      
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = thickness;
      ctx.moveTo(-textWidth / 2, underlineY);
      ctx.lineTo(textWidth / 2, underlineY);
      ctx.stroke();
    }

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
  selectedFace,
  ctx,
  w,
  h,
  drawFull,
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
    if (!comp.path || comp.path.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(comp.path[0].u * w, comp.path[0].v * h);
    for (let i = 1; i < comp.path.length; i++) {
      ctx.lineTo(comp.path[i].u * w, comp.path[i].v * h);
    }
    ctx.closePath();

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

  if (drawFull) {
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
    // Stroke individual components
    components.forEach((comp) => {
      if (!comp.path || comp.path.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(comp.path[0].u * w, comp.path[0].v * h);
      for (let i = 1; i < comp.path.length; i++) {
        ctx.lineTo(comp.path[i].u * w, comp.path[i].v * h);
      }
      ctx.closePath();
      ctx.stroke();
    });
  }
  ctx.restore();

  // 3. Highlight selected face with solid blue border
  if (selectedFace) {
    const comp = components.find((c) => c.id === selectedFace);
    if (comp && comp.path && comp.path.length > 0) {
      ctx.beginPath();
      ctx.moveTo(comp.path[0].u * w, comp.path[0].v * h);
      for (let i = 1; i < comp.path.length; i++) {
        ctx.lineTo(comp.path[i].u * w, comp.path[i].v * h);
      }
      ctx.closePath();

      ctx.strokeStyle = "#3b82f6"; // solid blue-500
      ctx.lineWidth = 2;
      ctx.stroke();
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

function orderEdgesToPath(edges) {
  if (edges.length === 0) return [];
  const edgeMap = new Map();
  edges.forEach((e) => {
    if (!edgeMap.has(e.k1)) edgeMap.set(e.k1, []);
    if (!edgeMap.has(e.k2)) edgeMap.set(e.k2, []);
    edgeMap.get(e.k1).push(e);
    edgeMap.get(e.k2).push(e);
  });

  const path = [];
  const usedEdges = new Set();

  let currentEdge = edges[0];
  usedEdges.add(currentEdge);
  path.push(currentEdge.p1);
  let currentKey = currentEdge.k2;

  while (usedEdges.size < edges.length) {
    // Add the point corresponding to currentKey
    path.push(currentEdge.k1 === currentKey ? currentEdge.p1 : currentEdge.p2);

    const connected = edgeMap.get(currentKey);
    if (!connected) break;
    const nextEdge = connected.find((e) => !usedEdges.has(e));
    if (!nextEdge) {
      // Might be a disconnected sub-island (e.g. holes), but we just break for the main outline
      break;
    }
    usedEdges.add(nextEdge);
    currentEdge = nextEdge;
    currentKey =
      currentEdge.k1 === currentKey ? currentEdge.k2 : currentEdge.k1;
  }

  return path;
}

export function extractUvComponents(mesh) {
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

  for (const edge of uvEdgeMap.values()) {
    if (edge.tris.length >= 2) {
      const t1 = triangles[edge.tris[0]];
      const t2 = triangles[edge.tris[1]];

      // Check if the shared edge is axis-aligned (horizontal or vertical in UV space)
      const dx = Math.abs(edge.p1.u - edge.p2.u);
      const dy = Math.abs(edge.p1.v - edge.p2.v);
      const isAxisAligned = dx < 0.001 || dy < 0.001;

      // Merge triangles if they are coplanar AND the shared edge is a diagonal (not a crease)
      if (dot(t1.normal, t2.normal) > 0.8) {
        if (!isAxisAligned) {
          union(t1.id, t2.id);
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
        if (edge.tris.length >= 2) {
          const otherTriId =
            edge.tris[0] === triId ? edge.tris[1] : edge.tris[0];
          if (faceTriSet.has(otherTriId)) isBoundary = false;
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

    const area = (maxU - minU) * (maxV - minV);
    if (area < 0.0025 || outlineEdges.length < 3) continue;

    const path = orderEdgesToPath(outlineEdges);
    if (path.length > 0) {
      finalComponents.push({
        id: `face_${faceCounter++}`,
        path,
        minU,
        maxU,
        minV,
        maxV,
        area,
      });
    }
  }

  return finalComponents;
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
      onSelectedLayerChange,
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
    useEffect(() => { onSelectedLayerChangeRef.current = onSelectedLayerChange; }, [onSelectedLayerChange]);
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
    const [toolMode, setToolMode] = useState("cursor"); // 'cursor' | 'hand'

    // History State
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // UV Interaction States
    const [uvComponents, setUvComponents] = useState([]);
    const uvComponentsRef = useRef([]); // for sync access in event handlers
    const [selectedFace, setSelectedFace] = useState(null);
    const [selectedFaceUv, setSelectedFaceUv] = useState(null);
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
          selectedFace,
          ctx,
          w,
          h,
          fullUv,
        );
      }

      const scale = canvasScaleRef.current;
      imagesRef.current.forEach((img) => {
        img.draw(ctx, scale);
      });

      // Draw controls for selected image LAST (on top)
      if (selectedImageRef.current) {
        selectedImageRef.current.drawControls(ctx, scale);
      }
    }, [showUv, fullUv, faceColors, selectedFace]);

    const bakeTexture = useCallback((ignoreSelection = false) => {
      const bakeCanvas = textureCanvasRef.current;
      if (!bakeCanvas) return;
      const bakeCtx = bakeCanvas.getContext("2d");

      bakeCtx.clearRect(0, 0, bakeCanvas.width, bakeCanvas.height);
      bakeCtx.fillStyle = bgColor;
      bakeCtx.fillRect(0, 0, bakeCanvas.width, bakeCanvas.height);

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

      // --- Highlight Selected Face in 3D ---
      if (selectedFace && !ignoreSelection) {
        const comp = uvComponentsRef.current.find((c) => c.id === selectedFace);
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
          if (!faceColors[selectedFace]) {
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
      }
      imagesRef.current.forEach((item) => {
        bakeCtx.save();
        bakeCtx.globalAlpha = item.opacity;
        bakeCtx.translate(item.x + item.width / 2, item.y + item.height / 2);
        bakeCtx.rotate(item.rotation);
        bakeCtx.scale(item.flipX ? -1 : 1, item.flipY ? -1 : 1);
        if (item instanceof DraggableText) {
          const scaleX = item.width / item.nativeWidth;
          const scaleY = item.height / item.nativeHeight;
          bakeCtx.scale(scaleX, scaleY);

          bakeCtx.fillStyle = item.color;
          bakeCtx.font = `${item.italic ? 'italic ' : ''}${item.bold ? 'bold ' : ''}${item.fontSize}px ${item.fontFamily}`;
          bakeCtx.textAlign = 'center';
          bakeCtx.textBaseline = 'middle';
          bakeCtx.fillText(item.text, 0, 0);
          
          if (item.underline) {
            const metrics = bakeCtx.measureText(item.text);
            const textWidth = metrics.width;
            const underlineY = item.fontSize * 0.4;
            const thickness = Math.max(1, item.fontSize / 15);
            
            bakeCtx.beginPath();
            bakeCtx.strokeStyle = item.color;
            bakeCtx.lineWidth = thickness;
            bakeCtx.moveTo(-textWidth / 2, underlineY);
            bakeCtx.lineTo(textWidth / 2, underlineY);
            bakeCtx.stroke();
          }
        } else {
          bakeCtx.drawImage(
            item.img,
            -item.width / 2,
            -item.height / 2,
            item.width,
            item.height,
          );
        }
        bakeCtx.restore();
      });

      onTextureUpdatedRef.current();
    }, [bgColor, faceColors, selectedFace, textureCanvasRef]);

    // --- History Logic ---
    const pushHistory = useCallback(
      (actionImages, actionFaceColors) => {
        const stateSnapshot = {
          images: actionImages.map((item) => {
            if (item instanceof DraggableText) {
              return {
                type: 'text',
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
              type: 'image',
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
          if (itemData.type === 'text') {
            const dt = new DraggableText(itemData.text, textureSizeRef.current, {
              fontSize: itemData.fontSize,
              color: itemData.color,
              fontFamily: itemData.fontFamily,
              bold: itemData.bold,
              italic: itemData.italic,
              underline: itemData.underline,
            });
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
        const components = extractUvComponents(bestMesh);
        uvComponentsRef.current = components;
        setUvComponents(components);

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
    }, [bgColor, faceColors, selectedFace, bakeTexture]);

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

      selectedImageRef.current = clickedImage;
      setSelectedImage(clickedImage);
      onSelectedLayerChangeRef.current?.(clickedImage);

      if (clickedImage) {
        interaction.isDragging = true;
        interaction.mode = HANDLE.MOVE;
        interaction.startMx = mx;
        interaction.startMy = my;
        interaction.startImgX = clickedImage.x;
        interaction.startImgY = clickedImage.y;
        setCursor("move");
        displayCanvas.setPointerCapture(e.pointerId);
        startRenderLoop();
        // Clear face selection when clicking an image
        setSelectedFace(null);
        setSelectedFaceUv(null);
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
        setSelectedFace(clickedFace);
        setSelectedFaceUv(clickedUv);
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

      // --- Dragging ---
      const img = selectedImageRef.current;
      if (!img) return;

      const mode = interaction.mode;
      const dx = mx - interaction.startMx;
      const dy = my - interaction.startMy;

      if (mode === HANDLE.MOVE) {
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
        img.rotation =
          interaction.startRotation + (currentAngle - interaction.startAngle);
      } else {
        // Resize handles
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

    function onUploadImage(fileOrUrl) {
      if (!fileOrUrl) return;
      const url =
        typeof fileOrUrl === "string"
          ? fileOrUrl
          : URL.createObjectURL(fileOrUrl);
      const img = new Image();
      img.onload = () => {
        const newImg = new DraggableImage(img, textureSizeRef.current);
        imagesRef.current.push(newImg);
        selectedImageRef.current = newImg;
        setSelectedImage(newImg);
        needsDisplayRedrawRef.current = true;
        bakeTexture();
        saveState();
        redrawDisplay();
      };
      img.src = url;
    }

    useImperativeHandle(ref, () => ({
      uploadImage: (file) => {
        onUploadImage(file);
      },
      addText: (text = 'Text') => {
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
            ctx.font = `${item.italic ? 'italic ' : ''}${item.bold ? 'bold ' : ''}${item.fontSize}px ${item.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.text, 0, 0);
            
            if (item.underline) {
              const metrics = ctx.measureText(item.text);
              const textWidth = metrics.width;
              const underlineY = item.fontSize * 0.4;
              const thickness = Math.max(1, item.fontSize / 15);
              
              ctx.beginPath();
              ctx.strokeStyle = item.color;
              ctx.lineWidth = thickness;
              ctx.moveTo(-textWidth / 2, underlineY);
              ctx.lineTo(textWidth / 2, underlineY);
              ctx.stroke();
            }
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
                  if (sel instanceof DraggableText && sel.contains(mx, my, scale)) {
                    const renderScale = rect.width / displayCanvas.width;
                    const scaledX = (sel.x / scale) * renderScale + rect.left;
                    const scaledY = (sel.y / scale) * renderScale + rect.top;
                    const scaledW = (sel.width / scale) * renderScale;
                    const scaledH = (sel.height / scale) * renderScale;
                    setEditingText({ layer: sel, x: scaledX, y: scaledY, w: scaledW, h: scaledH });
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
                    position: 'fixed',
                    left: editingText.x,
                    top: editingText.y,
                    width: editingText.w * 1.5,
                    zIndex: 9999,
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <input
                    autoFocus
                    defaultValue={editingText.layer.text}
                    onFocus={(e) => {
                      if (e.target.value === 'Your Text') {
                        e.target.value = '';
                      } else {
                        e.target.select();
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim() || 'Text';
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
                      if (e.key === 'Enter') e.target.blur();
                      if (e.key === 'Escape') setEditingText(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: 14,
                      fontFamily: editingText.layer.fontFamily,
                      color: editingText.layer.color,
                      border: '2px solid #7c5cfc',
                      borderRadius: 6,
                      outline: 'none',
                      background: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 2px 16px rgba(124,92,252,0.2)',
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
                            const next = { ...prev, [selectedFace]: val };
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
                          delete newColors[selectedFace];
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
                  className={`w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${toolMode === "cursor" ? "bg-gray-100" : "bg-transparent hover:bg-gray-50"}`}
                >
                  <img
                    src={cursorIcon}
                    alt="Cursor"
                    className="w-6 h-6 object-contain opacity-80 hover:opacity-100"
                  />
                </button>
              </Tooltip>
              <Tooltip label="Pan Tool">
                <button
                  onClick={() => setToolMode("hand")}
                  className={`w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${toolMode === "hand" ? "bg-gray-100" : "bg-transparent hover:bg-gray-50"}`}
                >
                  <img
                    src={handIcon}
                    alt="Hand"
                    className="w-6 h-6 object-contain opacity-80 hover:opacity-100"
                  />
                </button>
              </Tooltip>

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
