---
tags:
  - vmc
  - multiengine-aerodynamics
---

### Question

What do the landing gear and flaps do to Vmc?

### Answer

**Extending the landing gear lowers Vmc.** The gear adds keel area and drag to the airplane, which increases **directional stability** - the fuselage resists being yawed out of line, so less rudder is needed to balance the asymmetric thrust. Certification is done with the gear **retracted** because that's the more unfavorable case.

**Extending flaps also lowers Vmc**, slightly. Two things are going on:

- **Lower angle of attack.** Flaps let the wing make the same lift at a lower AoA. The thrust asymmetry you're fighting comes largely from **P-factor**, and P-factor grows with angle of attack - the descending blade bites harder the more the airplane is pitched up. Less AoA means a smaller yawing moment to balance, so less rudder, so a lower Vmc.
- **Flap drag in the slipstream.** Extended flaps add drag behind the CG, and the flap section behind the **operating** engine sits in that engine's accelerated slipstream, so it makes more drag than the same section on the dead side. That small drag asymmetry pulls the nose back toward the operating engine, opposing the yaw.

The flap effect is small and airplane-specific, and it's why certification uses the **takeoff** flap position rather than clean. Note that the AFH lists takeoff flaps as a certification condition without explaining the mechanism - the reasoning above is aerodynamic, not a quotable handbook passage.

Don't turn any of this into a technique. Lowering the gear to reduce Vmc trades a control benefit for a large drag penalty and destroys whatever single-engine climb you had. It's a good exam answer about aerodynamics, and a bad plan in the airplane.

### Sources

- [14 CFR § 23.149 (2014 edition) - Minimum control speed](https://www.govinfo.gov/content/pkg/CFR-2014-title14-vol1/pdf/CFR-2014-title14-vol1-sec23-149.pdf)
- [FAA Airplane Flying Handbook, Chapter 13 - Transition to Multiengine Airplanes](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/14_afh_ch13.pdf)
