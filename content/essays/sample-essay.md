---
title: "Sample Essay: The Art of Minimalist Writing"
date: 2023-11-15
summary: "An exploration of minimalist writing principles and how they can improve clarity and impact."
---

# The Art of Minimalist Writing

In this slide we highlight the use cases we see as 'Quick Fix' opportunities. we think  for many of these use cases we can deliver a significant process improvement within one to two quarters, using our existing team and partners we closely work with such as data management, teams within the product org.

---

"First, the Quarterly Management Report. This use case is from the Product Governance team. It’s a critical, high-visibility report. This report mainly relies on a manual excel based process, where data from each region is joined together. The timeline to put everything together is also quite tight so often changes in fund info like benchmarks, categories get missed. There are also human error like formatting changes etc. Governance team spends a ton of time reviewing and updating this process.  

---

We think we could quickly improve this process. Mike had previously developed a PBI based dashboard to source some performance data for the QMR funds. Adding a few extra datapoints such as benchmark and peer group returns would mean that the team can source all performance information from one place instead of various spreadsheets.

---

The next usecase is Morningstar  secids. Many of you are aware of this issue. These identifiers are  critical to link to Morningstar information about our funds, which are vital for our reporting and analysis. The core issue is a gap in our fund onboarding process, where IDs are not being consistently populated. This creates a major blind spot: even though Morningstar is rating our funds, we were unable to pull those ranks into EDL. We have tried to address this issue head-on. Currently the share class mapping is close to complete for prodcut types where Morningstar information is important. We still need a proper governance process to make sure that this issue is addressed during onboarding.

---

The Morningstar Category Overview. This use-case came from the product development team. They have to often look at Morningstar categories to understand the opportunity set, who are the top competitors, their pricing. They currently do not have a strand process and spend a lot of time on this analysis. We got  Mike F has been working working on a similar PBI view with Mike Wondoloski which adresses some of their needs, we would want to  out the dashboard to it also meets this need.

"We've also documented several smaller-scale issues. We're prioritizing effectively and plan to address many of them as part of these larger initiatives."

---

"Finally, the Canada Performance Report. This is the most comprehensive performance report that we have and covers all canadian platforms. The problem with this process is that more than 10 separate excel spreadsheets need to be maintained to update this report.  There are some improvements to the process already, by stripping out unused data and standardizing the format.

---

I will pause here for questions.

---

Data issues

### **Slide 2: Broader Data Issues & Needs Uncovered**

**(Opening)**
"Next, I want to highlight some broader data issues and other needs we've uncovered. These aren't tied to a single use case, but they impact the data quality of our reports and analysis across the board."

The first two item here are about validation of data we use.

**(Point 1: Morningstar Validation)**
Now that the bulk of the Morningstar ID mapping work is behind us, we are validating the completeness of Morningstar data within EDL. We are checking if the data for all the mapped share classes are flowing correctly into downstream reports. 

**(Point 2: AUM/Flows Validation)**

we’ve also identified potential improvements in our data sourcing. For example, Finance appears to have a global view of AUM and flows broken down by business lines that could be useful for several AUM/Flow related use cases. That said, we’ll need to validate this data and determine the best way to integrate it into our workflows.

**(Point 3: Product Info Changes / Governance)**
The third bullet—reflecting product information changes in EDL—ties into the broader issue of data governance. What we’re seeing is that when a fund’s key details change, such as its portfolio manager, name, or benchmark, those updates aren’t always captured consistently. This creates a serious data quality challenge, since reports can end up pulling outdated or incorrect information. We are closely following the work of the Onboarding Transformation Initiative, as they are planning to address this foundational need. It’s a long-term fix, with implementation timing currently estimated for no sooner than late 2026.

**(Point 4: Platform Data)**
We’re also seeing gaps where data for specific platforms is either incomplete our we do not have a clear view into how to source data for those platforms yet. For example, with GRS and MPW platform in canada, certain fields—like returns —are not  available in EDL in the same way as for other funds. At this stage, we’re still investigating the best approach to source this data.

**(Closing for Slide 2)**
"We've listed a few other items on the slide. I won't go into detail on each, but I'm happy to answer any questions."

Incremental Development 

These use cases would require more effort to address than quick fixes but are not quite transformational. Many of these items will require some support from partners such as finance or operations outside this team. Within this team we feel that the data required to solve for these use cases do exist in edl but we will need to do some digging and may need some help.

Transformational

Here the key word is new systems and business processes. For most of these use cases we have identified one or more datapoints that we currently do not have a way to source in EDL or 

Transformational

We have identified some of the items here as transformational. Currnelt
