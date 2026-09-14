---
tags:
  - propellers
  - multiengine-systems
---

### Question

How does a constant-speed propeller work on a multiengine airplane, and how does oil get to and from the propeller?

### Answer

- A **governor** senses engine RPM through flyweights and meters engine oil pressure to a piston in the propeller hub to change blade pitch. You select the **RPM**; the governor holds it as airspeed and power change.
- **On speed** - pilot valve centered, oil trapped in the hub, blade angle steady. **Underspeed** - the valve ports **oil into the hub** for a finer blade angle, unloading the engine. **Overspeed** - the valve ports **oil out of the hub** for a coarser angle, loading the engine down.
- Power setting order: **RPM before manifold pressure when increasing, manifold pressure before RPM when reducing.** That avoids unapproved high-MP/low-RPM combinations - approved ones in the AFM power charts are fine.

**Which way oil pushes the blades is usually reversed on a twin.** Most light piston twins use a **full-feathering, counterweighted, oil-pressure-to-decrease-pitch** propeller: governor oil drives the blades toward low pitch, while counterweights plus a spring or air charge drive them toward high pitch and ultimately feather. That is the opposite of the **oil-pressure-to-increase-pitch** arrangement on almost all singles, and it is why losing governor oil pressure moves a twin's propeller toward feather.

**The oil path out and back**

1. The **engine-driven oil pump** pressurizes the engine galleries, which feed the **governor** on its engine pad.
2. The governor's own **gear pump** boosts that supply to the much higher pressure needed to move the blades against the counterweights, spring, and centrifugal twisting moment. A relief valve returns the excess to the pump inlet.
3. Boosted oil leaves the pilot valve through **passages in the engine and propeller shaft** to the **hub piston**, driving the blades toward low pitch.
4. To coarsen pitch, the governor **ports that oil to drain**. The counterweights push the piston back, forcing hub oil back down the shaft, through the governor, and into the **accessory case, where it drains to the sump** for the engine pump to pick up again.

Two consequences worth knowing. It is a closed loop on **engine oil** - the propeller has no separate supply, so a failed dome or transfer seal is an engine oil leak. And pulling the prop control into the feather detent simply ports hub oil to drain - feathering needs oil to **leave** the propeller, not arrive, which is why what stops you feathering a spun-down engine is the anti-feathering lock pins rather than any loss of oil pressure.

### Sources

- [FAA Airplane Flying Handbook, Chapter 13 - Transition to Multiengine Airplanes](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/14_afh_ch13.pdf)
- [FAA Airplane Flying Handbook, Chapter 11 - Transition to Complex Airplanes](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/12_afh_ch11.pdf)
- [FAA Aviation Maintenance Technician Handbook - Powerplant (FAA-H-8083-32B), Chapter 7 - Propellers](https://www.faa.gov/regulationspolicies/handbooksmanuals/aviation/faa-h-8083-32b-chapter-7-propellers)
