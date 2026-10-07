# Teddy images used by the design boards (exported from the design system)

The boards reference these as `/_blob/<id>`; the id is the 32-hex string in each file name's source.

| File | Blob id | Used in |
|---|---|---|
| teddy-waving_5bb51609.png (239x182) | 5bb51609a7ff36b0643dc0cc23146ac6 | phone/OnbSplash (200x160 on a lilac tile #EDE3FB, 220x190, radius 40); phone/HomeVN "Share your @username with a client" suggestion tile (140 wide, top 18) |
| teddy-happy_22f5490f.png (306x213) | 22f5490f03888bc46a04dbf909a17ab4 | phone/HomeVN "Lock a milestone for a freelancer" suggestion tile (links to ContractNew1Freelancer; 140 wide, top 18) |
| teddy-curious_6b5178b3.png (258x209) | 6b5178b3c2e1fe17910ea565b9a1f09f | phone/HomeVN empty state (140x112, object-fit contain, on a 168x132 lilac tile) |

Put them in `public/design-assets/` (or `public/teddy/`) and point the TODO(asset) slots at them.
