import Svg, { Circle, Polyline } from 'react-native-svg';

import { TrendPlot } from '@/domain/weightTrend';
import { colors } from '@/theme/tokens';

export type TrendLineProps = {
  plots: readonly TrendPlot[];
  width: number;
  height: number;
  accessibilityLabel: string;
};

const STROKE_WIDTH = 2.4;
const MARKER_RADIUS = 4.5;
const MARKER_RING_RADIUS = 9;
const MARKER_RING_OPACITY = 0.28;
const MARKER_RING_STROKE = 2;

/**
 * The weight trend, from the mockup: a coral line with a hollow marker on the latest point.
 *
 * A single weigh-in draws the marker and no line — one measurement is not a trend — and a gap in
 * the history is a gap between points rather than a value the app made up.
 */
export const TrendLine = ({ plots, width, height, accessibilityLabel }: TrendLineProps) => {
  const latest = plots[plots.length - 1];

  return (
    <Svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <TrendPath plots={plots} />
      <TrendMarker plot={latest} />
    </Svg>
  );
};

type TrendPathProps = {
  plots: readonly TrendPlot[];
};

const TrendPath = ({ plots }: TrendPathProps) => {
  if (plots.length < 2) {
    return null;
  }

  return (
    <Polyline
      points={plots.map((plot) => `${plot.x},${plot.y}`).join(' ')}
      fill="none"
      stroke={colors.coral}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

type TrendMarkerProps = {
  plot: TrendPlot | undefined;
};

const TrendMarker = ({ plot }: TrendMarkerProps) => {
  if (plot === undefined) {
    return null;
  }

  return (
    <>
      <Circle cx={plot.x} cy={plot.y} r={MARKER_RADIUS} fill={colors.coral} />
      <Circle
        cx={plot.x}
        cy={plot.y}
        r={MARKER_RING_RADIUS}
        fill="none"
        stroke={colors.coral}
        strokeOpacity={MARKER_RING_OPACITY}
        strokeWidth={MARKER_RING_STROKE}
      />
    </>
  );
};
