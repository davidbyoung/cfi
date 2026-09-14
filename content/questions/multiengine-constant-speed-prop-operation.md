---
tags:
  - propellers
  - multiengine-systems
---

### Question

How does a constant-speed propeller work on a multiengine airplane, and how does oil get to and from the propeller?

### Answer

- A **governor** senses engine RPM through flyweights and meters engine oil pressure to a piston in the propeller hub to change blade pitch.
- You set the **RPM** with the propeller control; the governor then changes blade angle to hold it as airspeed and power change.
- **On speed** - Flyweights balanced, pilot valve centered, oil trapped in the hub, blade angle steady.
- **Underspeed** - Flyweights move in, the pilot valve ports **oil into the hub** to decrease blade angle (finer), removing load so the engine accelerates.
- **Overspeed** - Flyweights move out, the pilot valve ports **oil out of the hub** to increase blade angle (coarser), adding load to slow the engine.
- Power setting order: **RPM before manifold pressure when increasing power, manifold pressure before RPM when reducing it.** The point is to avoid unapproved high-manifold-pressure/low-RPM combinations - such combinations are perfectly acceptable when the AFM/POH power charts specifically approve them.

**Which way oil pushes the blades is usually reversed on a twin.** Most light piston twins use a **full-feathering, counterweighted, oil-pressure-to-decrease-pitch** propeller: governor oil moves the blades toward low pitch / high RPM, while counterweights plus a spring or air charge move them toward high pitch and ultimately feather. That is the opposite of the **oil-pressure-to-increase-pitch** arrangement on almost all single-engine airplanes. A loss of governor oil pressure therefore tends to move a light twin's propeller toward feather.

**The oil path to the propeller**

1. The **engine-driven oil pump** pulls oil from the sump and pressurizes the engine galleries.
2. Gallery oil feeds the **governor**, mounted on an engine pad and driven off the accessory gearing.
3. The governor's own **gear pump** boosts that supply to the much higher pressure needed to operate the propeller - it has to overcome the counterweights, the spring or air charge, and centrifugal twisting moment. A relief valve dumps the excess back to the pump inlet.
4. Boosted oil leaves the pilot valve and travels through **passages in the engine and propeller shaft** to the **piston in the propeller hub**, driving the blades toward low pitch. The exact transfer arrangement varies by installation.

**The oil path back**

- To increase (coarsen) pitch, the governor **ports the propeller oil to drain**. The counterweights and spring or air charge push the piston back, forcing hub oil back through the shaft passages, through the governor, and out into the **engine accessory case, where it drains to the sump** and is picked up by the engine oil pump again.
- It is a closed loop on **engine oil** - the propeller has no separate oil supply, so a failed dome or transfer seal is an engine oil leak, not just a prop problem.
- Pulling the prop control into the feather detent releases governor pressure and ports hub oil to drain, so the blades run all the way to feather.

**Why prompt feathering matters**

- Feathering does **not** require the governor to keep pumping oil into the propeller. It requires oil to **leave** the propeller so the counterweights and spring or air charge can increase blade angle.
- The limiting factor is mechanical: on most light twins, **anti-feathering lock pins** (centrifugally operated feathering locks) engage as RPM falls below roughly **600-1,000 RPM**, depending on the airplane. Once engaged, they prevent the blades from continuing toward feather. Their purpose is to keep the propeller from feathering during every normal shutdown.
- So an engine that is going to be feathered should be feathered **before RPM decays below the locking speed** - troubleshoot too long and you lose the option.
- Unfeathering normally relies on the **starter**: once the engine turns, the governor develops oil pressure and drives the blades out of feather. An **unfeathering accumulator**, where installed, stores pressurized engine oil and releases it toward the hub when the prop control is moved out of feather, moving the blades toward low pitch so the propeller windmills without prolonged cranking. Accumulators are optional equipment, common on training twins.

### Sources

- [FAA Airplane Flying Handbook, Chapter 13 - Transition to Multiengine Airplanes](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/14_afh_ch13.pdf)
- [FAA Airplane Flying Handbook, Chapter 11 - Transition to Complex Airplanes](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/12_afh_ch11.pdf)
- [FAA Aviation Maintenance Technician Handbook - Powerplant (FAA-H-8083-32B), Chapter 7 - Propellers](https://www.faa.gov/regulationspolicies/handbooksmanuals/aviation/faa-h-8083-32b-chapter-7-propellers)
