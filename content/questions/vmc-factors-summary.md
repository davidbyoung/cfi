---
tags:
  - vmc
  - multiengine-aerodynamics
---

### Question

Summarize the factors that affect V<sub>MC</sub> and which direction each one moves it.

### Answer

**SMACFUM** is the list of conditions your airplane's published V<sub>MC</sub> was measured under. Every letter but **U** is set to make V<sub>MC</sub> as high as possible - which is why the red line is a worst case rather than a number you will see in normal flight.

|       | Condition (as certified)                  | V<sub>MC</sub> | Why                                                                                                                                  |
| ----- | ----------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **S** | Sea level / low density altitude          | **Raises**     | Most power available, so the most asymmetric thrust                                                                                  |
| **M** | Max takeoff power on the operating engine | **Raises**     | More thrust, more yawing moment                                                                                                      |
| **A** | Aft CG                                    | **Raises**     | Shortens the rudder's moment arm, reducing its effectiveness                                                                         |
| **C** | Critical engine propeller windmilling     | **Raises**     | Drag on the dead side adds to the yaw                                                                                                |
| **F** | Flaps takeoff position, gear up           | **Raises**     | Extended gear aids directional stability; retracting it gives that up. The arrow is the gear's - no direction is published for flaps |
| **U** | Up to 5° of bank toward the good engine   | **Lowers**     | The horizontal component of lift balances the rudder's side force                                                                    |
| **M** | Most unfavorable weight - the light end   | **Raises**     | Less lift means less horizontal component available in that bank                                                                     |

- The published number is therefore a **worst case**. Reverse any row except **U** - feather the propeller, extend the gear, add weight, move the CG forward, climb - and actual V<sub>MC</sub> is lower than the red line.
- **U is the exception, and it cuts the other way.** The 5° bank is the one condition set to _help_, so it is the one row you can reverse to make things worse. Fly with less bank than that and actual V<sub>MC</sub> climbs **above** the published number.
- Density altitude assumes a **normally aspirated** engine. A turbocharged twin holds rated power to its critical altitude, so its V<sub>MC</sub> stays high well into the climb - above that altitude it falls off like any other.
- **This is a mnemonic for the factors that move V<sub>MC</sub> - not the certification standards.** [§ 23.149](https://www.govinfo.gov/content/pkg/CFR-2014-title14-vol1/pdf/CFR-2014-title14-vol1-sec23-149.pdf) also fixes trim and out of ground effect, and sets criteria the airplane had to _meet_: a 150 lb rudder pedal force limit, no more than 20° of heading change, and V<sub>MC</sub> no greater than 1.2 V<sub>S1</sub>. See the certification criteria question for those.

### Sources

- [14 CFR § 23.149 (2014 edition) - Minimum control speed](https://www.govinfo.gov/content/pkg/CFR-2014-title14-vol1/pdf/CFR-2014-title14-vol1-sec23-149.pdf)
- [FAA Airplane Flying Handbook, Chapter 13 - Transition to Multiengine Airplanes](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/14_afh_ch13.pdf)
