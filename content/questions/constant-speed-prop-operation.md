---
tags:
  - propellers
  - complex
  - aircraft-systems
---

### Question

How does a constant-speed propeller work, and what does the governor do?

### Answer

A constant-speed propeller holds a selected RPM by changing blade angle, so the engine stays at the RPM you set as airspeed and power change. The **propeller governor** is what does the work.

- Inside the governor, engine-driven **flyweights** are opposed by an adjustable **speeder spring**. The propeller control changes spring tension, which is how you select an RPM.
- The flyweights position a **pilot valve** that meters engine oil to or from a piston in the propeller hub.
- **On speed** - Flyweights and spring balanced, pilot valve centered, blade angle steady.
- **Overspeed** - RPM above the setting, flyweights move out, the governor **increases blade angle** (coarser) to add load and slow the engine back down.
- **Underspeed** - RPM below the setting, flyweights move in, the governor **decreases blade angle** (finer) to unload the engine so it accelerates.

**Which way oil moves the blades**

- On almost all single-engine airplanes, the propeller is **oil-pressure-to-increase-pitch**: governor oil drives the blades toward **high pitch / low RPM**, and a spring plus the blades' natural centrifugal twisting moment drives them back toward **low pitch / high RPM**.
- The consequence is the failure mode: lose governor oil pressure in a single and the propeller goes to **low pitch, high RPM** - the setting that gives you full power for a go-around. You may see the engine overspeed in a descent, but you are not left without thrust.
- Most light **twins** use the opposite arrangement, oil-pressure-to-decrease-pitch with counterweights, so a loss of oil pressure moves the propeller toward feather. That reversal is deliberate: on a twin, a failed engine that drifts toward feather beats one windmilling flat at maximum drag.

**Flying it**

- **Throttle controls manifold pressure, propeller control sets RPM.** Read manifold pressure on the MP gauge and RPM on the tachometer.
- Increasing power, go **prop forward then throttle up**. Reducing power, go **throttle back then prop back**. The point is to avoid unapproved high-manifold-pressure/low-RPM combinations - such settings are fine when the AFM/POH power charts specifically approve them.
- At low blade angles the governor may hit its **low-pitch stop**, and below that the propeller behaves like a fixed-pitch one - which is why RPM rises with airspeed on takeoff roll and in a dive at full-forward prop.
- A controllable-pitch propeller is one of the three items in the **complex** definition under **61.31(e)**, along with retractable gear and flaps.

### Sources

- [FAA Airplane Flying Handbook, Chapter 11 - Transition to Complex Airplanes](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/12_afh_ch11.pdf)
- [FAA Pilot's Handbook of Aeronautical Knowledge, Chapter 7 - Aircraft Systems](https://www.faa.gov/sites/faa.gov/files/09_phak_ch7.pdf)
- [FAA Aviation Maintenance Technician Handbook - Powerplant (FAA-H-8083-32B), Chapter 7 - Propellers](https://www.faa.gov/regulationspolicies/handbooksmanuals/aviation/faa-h-8083-32b-chapter-7-propellers)
