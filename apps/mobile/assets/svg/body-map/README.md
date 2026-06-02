# Body Map SVG Assets
#
# Files needed:
# - body-front.svg (Human silhouette — front view with clickable regions)
# - body-back.svg (Human silhouette — back view with clickable regions)
# - body-regions.svg (Region overlay layer for heat mapping)
#
# Implementation notes:
# - Use react-native-svg to render
# - Each body region is a <Path id="region-name"> element
# - onPress events mapped to BodyRegion type from @anicca/types
# - Intensity color mapped via getIntensityColor() from @anicca/utils
