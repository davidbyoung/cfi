---
tags:
  - vmc
  - multiengine-aerodynamics
---

### Question

What do the landing gear and flaps do to V<sub>MC</sub>?

### Answer

**Extending the landing gear lowers V<sub>MC</sub>.** The gear adds keel area and drag, increasing **directional stability** - the fuselage resists being yawed out of line, so less rudder is needed to balance the asymmetric thrust. Certification uses gear **retracted** because that's the more unfavorable case.

**Extending flaps also lowers V<sub>MC</sub>**, slightly, for two reasons:

- **Lower angle of attack.** Flaps let the wing make the same lift at a lower AoA, and the asymmetry you're fighting is largely **P-factor**, which grows with angle of attack. Less AoA means a smaller yawing moment to balance, so less rudder, so a lower V<sub>MC</sub>.
- **Flap drag in the slipstream.** The flap section behind the **operating** engine sits in that engine's accelerated slipstream and makes more drag than the same section on the dead side. That small asymmetry pulls the nose back toward the operating engine, opposing the yaw.

The flap effect is small and airplane-specific, which is why certification uses the **takeoff** position rather than clean. Note the AFH lists takeoff flaps as a condition without explaining the mechanism - the reasoning above is aerodynamic, not a quotable handbook passage.

Don't turn any of this into a technique. Lowering the gear to reduce V<sub>MC</sub> trades a control benefit for a large drag penalty and destroys whatever single-engine climb you had - a good exam answer about aerodynamics, and a bad plan in the airplane.

### Sources

- [14 CFR § 23.149 (2014 edition) - Minimum control speed](https://www.govinfo.gov/content/pkg/CFR-2014-title14-vol1/pdf/CFR-2014-title14-vol1-sec23-149.pdf)
- [FAA Airplane Flying Handbook, Chapter 13 - Transition to Multiengine Airplanes](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/14_afh_ch13.pdf)
