# Spring-Green Content Fragment Models — Build Spec

Create these in **AEM → Tools → Assets → Content Fragment Models** under the
`spring-green` configuration. Build in the order below so reference fields can
target already-existing models.

Field **Type** values match the AEM Content Fragment Model editor data-type
picker. Property/element **Name** is the technical name used in GraphQL.

---

## 1. FAQ  (build first — no dependencies)

Model name: **FAQ**  ·  Suggested tag/id: `faq`

| Field label | Type | Name | Notes |
|---|---|---|---|
| Question | Single line text | `question` | Required |
| Answer | Multi line text (Rich text) | `answer` | Required |
| Category | Single line text (Enumeration) | `category` | Values: Lawn, Pest, Tree, General |

Schema mapping: feeds **FAQPage** JSON-LD (Question / acceptedAnswer).

---

## 2. Service  (build second — no dependencies)

Model name: **Service**  ·  id: `service`

| Field label | Type | Name | Notes |
|---|---|---|---|
| Name | Single line text | `name` | Required (e.g. Lawn Care) |
| Slug | Single line text | `slug` | e.g. lawn-care-services |
| Short description | Multi line text | `shortDescription` | plain |
| Description | Multi line text (Rich text) | `description` | |
| Icon / Image | Content reference | `image` | DAM asset |
| Service URL | Single line text | `serviceUrl` | link path |
| Sub-services | Single line text, **Allow multiple values** | `subServices` | e.g. Core Aeration, Grub Control |

Schema mapping: **Service** / **OfferCatalog**. Reused on service pages AND
location pages.

---

## 3. Location  (build last — references Service + FAQ)

Model name: **Location**  ·  id: `location`

| Field label | Type | Name | Notes |
|---|---|---|---|
| Title | Single line text | `title` | e.g. "Janesville, WI" |
| Slug | Single line text | `slug` | `janesville-wi` (URL key) |
| Franchisee name | Single line text | `franchiseeName` | local owner/operator |
| Street address | Single line text | `streetAddress` | |
| City | Single line text | `city` | |
| State | Single line text (Enumeration) | `state` | US state codes |
| Postal code | Single line text | `postalCode` | |
| Latitude | Number | `latitude` | for geo / maps |
| Longitude | Number | `longitude` | |
| Phone | Single line text | `phone` | tel: + schema telephone |
| Email | Single line text | `email` | |
| Service areas | Single line text, **Allow multiple values** | `serviceAreas` | towns served |
| Opening hours | Multi line text | `hours` | or reference a dedicated model later |
| Hero image | Content reference | `heroImage` | DAM asset |
| Intro | Multi line text (Rich text) | `intro` | local blurb |
| Services offered | **Content fragment reference**, target model **Service**, **Allow multiple** | `servicesOffered` | which services this location does |
| FAQs | **Content fragment reference**, target model **FAQ**, **Allow multiple** | `faqs` | local FAQs |
| Meta title | Single line text | `metaTitle` | SEO |
| Meta description | Multi line text | `metaDescription` | SEO |

Schema mapping: **LocalBusiness** (+ `address`, `geo`, `telephone`,
`areaServed`), with `makesOffer`/`hasOfferCatalog` from `servicesOffered` and a
**FAQPage** from `faqs`.

---

## Headless delivery notes

- Enable **GraphQL** for the `spring-green` configuration and create a
  **persisted query** (e.g. `locationBySlug`) so web + app + other channels
  fetch the same data.
- Reference fields keep data DRY: update a Service or FAQ once → every Location
  that references it reflects the change. This is the core headless win and the
  reason Service/FAQ are separate atomic models rather than fields on Location.
- Build order matters: FAQ + Service must exist before Location's reference
  fields can target them.

## EDS integration (later, when AEM <-> EDS auth is live)
A `location` EDS block queries the GraphQL persisted query by slug and renders
the page + per-location LocalBusiness/Service/FAQPage JSON-LD. For the demo the
same block can read CF-shaped local JSON; production swaps the data source to
the GraphQL endpoint with no rework.
