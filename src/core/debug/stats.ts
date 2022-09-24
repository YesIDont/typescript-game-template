export type TStatsPanel = { dom: HTMLCanvasElement; update: (value: any, maxValue: any) => void };

function newStatsPanel(name: string, foreground: string, background: string): TStatsPanel {
  let min = Infinity;
  let max = 0;
  const { round } = Math;
  const pixelsRation = round(window.devicePixelRatio || 1);

  const WIDTH = 80 * pixelsRation,
    HEIGHT = 48 * pixelsRation,
    TEXT_X = 3 * pixelsRation,
    TEXT_Y = 2 * pixelsRation,
    GRAPH_X = 3 * pixelsRation,
    GRAPH_Y = 15 * pixelsRation,
    GRAPH_WIDTH = 74 * pixelsRation,
    GRAPH_HEIGHT = 30 * pixelsRation;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.cssText = 'width:80px;height:48px';

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Stats canvas not initiated properly.');

  context.font = `bold ${9 * pixelsRation}px Helvetica,Arial,sans-serif`;
  context.textBaseline = 'top';

  context.fillStyle = background;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = foreground;
  context.fillText(name, TEXT_X, TEXT_Y);
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

  context.fillStyle = background;
  context.globalAlpha = 0.9;
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

  return {
    dom: canvas,

    update(value, maxValue): void {
      min = Math.min(min, value);
      max = Math.max(max, value);

      context.fillStyle = background;
      context.globalAlpha = 1;
      context.fillRect(0, 0, WIDTH, GRAPH_Y);
      context.fillStyle = foreground;
      context.fillText(
        `${Math.round(value)} ${name} (${Math.round(min)}-${Math.round(max)})`,
        TEXT_X,
        TEXT_Y,
      );

      context.drawImage(
        canvas,
        GRAPH_X + pixelsRation,
        GRAPH_Y,
        GRAPH_WIDTH - pixelsRation,
        GRAPH_HEIGHT,
        GRAPH_X,
        GRAPH_Y,
        GRAPH_WIDTH - pixelsRation,
        GRAPH_HEIGHT,
      );

      context.fillRect(GRAPH_X + GRAPH_WIDTH - pixelsRation, GRAPH_Y, pixelsRation, GRAPH_HEIGHT);

      context.fillStyle = background;
      context.globalAlpha = 0.9;
      context.fillRect(
        GRAPH_X + GRAPH_WIDTH - pixelsRation,
        GRAPH_Y,
        pixelsRation,
        round((1 - value / maxValue) * GRAPH_HEIGHT),
      );
    },
  };
}

export type TStats = {
  REVISION: number;
  dom: HTMLDivElement;
  addPanel: (panel: TStatsPanel) => TStatsPanel;
  showPanel: (id: number) => void;
  begin: () => void;
  end: () => number;
  update: () => void;
  // Backwards Compatibility
  domElement: HTMLDivElement;
  setMode: (id: number) => void;
};

export function newStats(): TStats {
  let mode = 0;

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
  container.addEventListener(
    'click',
    function (event) {
      event.preventDefault();
      showPanel(++mode % container.children.length);
    },
    false,
  );

  //

  function addPanel(panel: TStatsPanel): TStatsPanel {
    container.appendChild(panel.dom);

    return panel;
  }

  function showPanel(id: number): void {
    for (let i = 0; i < container.children.length; i++) {
      const e = container.children[i] as HTMLElement;
      e.style.display = i === id ? 'block' : 'none';
    }

    mode = id;
  }

  //

  let beginTime = (performance || Date).now(),
    prevTime = beginTime,
    frames = 0;

  const fpsPanel = addPanel(newStatsPanel('FPS', '#0ff', '#002'));
  const msPanel = addPanel(newStatsPanel('MS', '#0f0', '#020'));

  let memPanel: TStatsPanel | undefined;
  if (self.performance && (self.performance as unknown as { memory: any }).memory) {
    memPanel = addPanel(newStatsPanel('MB', '#f08', '#201'));
  }

  showPanel(0);

  return {
    REVISION: 16,

    dom: container,

    addPanel: addPanel,
    showPanel: showPanel,

    begin(): void {
      beginTime = (performance || Date).now();
    },

    end(): number {
      frames++;

      const time = (performance || Date).now();

      msPanel.update(time - beginTime, 200);

      if (time >= prevTime + 1000) {
        fpsPanel.update((frames * 1000) / (time - prevTime), 100);

        prevTime = time;
        frames = 0;

        if (memPanel) {
          const { memory } = performance as unknown as { memory: any };
          memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
        }
      }

      return time;
    },

    update(): void {
      beginTime = this.end();
    },

    // Backwards Compatibility

    domElement: container,
    setMode: showPanel,
  };
}
