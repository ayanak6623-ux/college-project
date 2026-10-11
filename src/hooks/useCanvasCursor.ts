import { useEffect } from 'react';

const useCanvasCursor = () => {
  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let cursor = { x: width / 2, y: height / 2 };
    let isRunning = true;
    let frameId: number;

    const E = {
      friction: 0.5,
      trails: 15,
      size: 20,
      dampening: 0.25,
      tension: 0.98,
    };

    class Oscillator {
      phase: number;
      offset: number;
      frequency: number;
      amplitude: number;
      value: number;

      constructor(options: { phase?: number; offset?: number; frequency?: number; amplitude?: number }) {
        this.phase = options.phase || 0;
        this.offset = options.offset || 0;
        this.frequency = options.frequency || 0.001;
        this.amplitude = options.amplitude || 1;
        this.value = 0;
      }

      update() {
        this.phase += this.frequency;
        this.value = this.offset + Math.sin(this.phase) * this.amplitude;
        return this.value;
      }
    }

    class Node {
      x: number;
      y: number;
      vx: number;
      vy: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
      }
    }

    class Line {
      spring: number;
      friction: number;
      nodes: Node[];

      constructor(options: { spring: number }) {
        this.spring = options.spring + 0.1 * Math.random() - 0.02;
        this.friction = E.friction + 0.01 * Math.random() - 0.002;
        this.nodes = [];
        for (let i = 0; i < E.size; i++) {
          this.nodes.push(new Node(cursor.x, cursor.y));
        }
      }

      update() {
        let spring = this.spring;
        let node = this.nodes[0];

        node.vx += (cursor.x - node.x) * spring;
        node.vy += (cursor.y - node.y) * spring;

        for (let i = 0; i < this.nodes.length; i++) {
          node = this.nodes[i];
          if (i > 0) {
            const prev = this.nodes[i - 1];
            node.vx += (prev.x - node.x) * spring;
            node.vy += (prev.y - node.y) * spring;
            node.vx += prev.vx * E.dampening;
            node.vy += prev.vy * E.dampening;
          }

          node.vx *= this.friction;
          node.vy *= this.friction;
          node.x += node.vx;
          node.y += node.vy;
          spring *= E.tension;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        let node = this.nodes[0];
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);

        let i;
        for (i = 1; i < this.nodes.length - 2; i++) {
          const a = this.nodes[i];
          const b = this.nodes[i + 1];
          const mx = (a.x + b.x) * 0.5;
          const my = (a.y + b.y) * 0.5;
          ctx.quadraticCurveTo(a.x, a.y, mx, my);
        }

        const a = this.nodes[i];
        const b = this.nodes[i + 1];
        if (a && b) {
          ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
        }
        ctx.stroke();
        ctx.closePath();
      }
    }

    const f = new Oscillator({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 25,
      frequency: 0.0015,
      offset: 252,
    });

    let lines: Line[] = [];
    for (let i = 0; i < E.trails; i++) {
      lines.push(new Line({ spring: 0.4 + (i / E.trails) * 0.025 }));
    }

    const updatePosition = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        cursor.x = e.touches[0].pageX;
        cursor.y = e.touches[0].pageY;
      } else {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      updatePosition(e);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        updatePosition(e);
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (!isRunning) return;

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `hsla(${Math.round(f.update())}, 75%, 60%, 0.3)`;
      ctx.lineWidth = 1;

      for (let i = 0; i < E.trails; i++) {
        const line = lines[i];
        line.update();
        line.draw(ctx);
      }

      frameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (frameId) window.cancelAnimationFrame(frameId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
};

export default useCanvasCursor;
