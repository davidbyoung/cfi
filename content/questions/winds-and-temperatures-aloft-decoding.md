---
tags:
  - forecasts
  - weather
---

### Question

How do you decode a winds and temperatures aloft forecast?

### Answer

- The format is **DDff±TT**: direction in tens of degrees (true), speed in knots, and temperature in °C.
  - `1312+05` is wind 130° at 12 kt, +5 °C.
- **9900** means light and variable, less than 5 kt.
- Speeds of 100 to 199 kt are coded by adding 50 to the direction and subtracting 100 from the speed, so `7525` decodes as 250° at 125 kt. Any direction pair above 36 is this case.
- Above 24,000 ft, temperatures are always negative and the minus sign is dropped.
- No winds are forecast for a level within 1,500 ft of the station elevation, and no temperatures within 2,500 ft.
- The directions are **true**, not magnetic, so correct for variation before comparing them to a heading.

### Sources

- [FAA Aviation Weather Handbook](https://www.faa.gov/sites/faa.gov/files/FAA-H-8083-28B.pdf)
- [Aviation Weather Center - Data Help](https://aviationweather.gov/help/data/)

### Supplements

- [AOPA - Training Tip: Not-so-easy breezy](https://www.aopa.org/news-and-media/all-news/2018/march/16/training-tip)
