# System Designs

## Points

The `Point` obejct is as follow

```typescript
interface Point {
    sourceId: string;
    points: number;
    basePoints: number;
    multiplier: number;
    date: Date;
}
```

### `sourceId`

For `sourceId`, we should use the following format `SOURCE_TYPE=NAN-OID` where `SOURCE_TYPE` is one of the following:

- `EVT` events
- `PUR` purchases
- `ADJ` adjustments
- `RFD` refunds
- `REF` referrals

and 6 digits of Nano ID for the source.

**Examples:**

- `EVT-1A2-B3C` for event **1A2-B3C**
- `PUR-A7C-55Q` for purchase **A7C-55Q**
