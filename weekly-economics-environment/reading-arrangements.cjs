'use strict';
/* Individually authored reading compositions. These are not a rotation or a
 * fallback: a future reading needs its own registered arrangement and rationale. */
module.exports=({row,field,inset,flo,gap})=>({...module.exports.authored,
 electrification:({E,O,Q,N,A,M,D})=>E+row('electrification-opportunity',A,O+D(),'1.35fr','1fr')+row('electrification-private-value',inset('adoption-equation',M(),'100%','left'),N,'1.15fr','1fr')+gap(Q),
 grid:({E,O,Q,N,A,L,T})=>row('grid-stakes',E,O,'1.4fr','1fr')+inset('grid-announced-funding',A,'72%')+L()+row('grid-delivery-boundary',Q,N,'1.25fr','1fr')+T(),
 'carbon-border':({E,O,Q,N,X,G})=>row('border-opening',E,O,'1.3fr','1fr')+G()+row('border-identification',X(),Q+N,'1.2fr','1fr'),
 insurance:({E,O,Q,N,A,M,L})=>row('insurance-spatial-opening',E,O,'1.5fr','1fr')+field('insurance-measurement',row('insurance-estimates',A,M(),'1fr','1.15fr'),'gatefold')+row('insurance-sampling',Q,N,'1.4fr','1fr')+L(),
 glyphosate:({E,O,Q,N,D,X})=>E+row('glyphosate-action',D(),O,'1.6fr','1fr')+row('glyphosate-evidence',Q+N,X(),'1fr','1.25fr'),
 '2026-10-02-green-spending':({E,O,Q,N,A,M,X})=>E+field('spending-estimand',row('spending-figure-and-model',A,M(),'1fr','1.15fr'),'folio')+row('spending-design',O+N,X(),'1fr','1.2fr')+Q,
 '2026-10-02-policy-mix':({E,O,Q,N,A,L})=>flo('fossil-price-feedback',A,E+O,'left','58%')+L()+row('policy-mix-qualification',N,Q,'1fr','1.4fr'),
 '2026-10-02-amoc':({E,O,Q,N,A,G,T})=>E+row('amoc-adjustment',G(),O+N,'1.4fr','1fr')+A+row('amoc-time-and-inference',T(),Q,'1.5fr','1fr'),
 '2026-10-02-storage':({E,O,Q,N,M,D,L})=>row('storage-two-values',E,O,'1.2fr','1fr')+field('storage-operating-choice',row('storage-model-and-entry',M(),D(),'1.2fr','1fr'),'ledger')+row('storage-objectives',N,Q,'1fr','1.3fr')+L(),
 '2026-10-02-tax-bias':({E,O,Q,N,L,G})=>E+L()+row('tax-financing-path',O+Q,G(),'1fr','1.3fr')+inset('tax-research',N,'76%','left'),
 '2026-10-09-trade-climate':({E,O,Q,N,A,L,D})=>row('trade-participation',E,O,'1.5fr','1fr')+A+field('trade-sharing',L()+row('trade-choice-and-research',D(),N,'1.4fr','1fr'),'open')+Q,
 '2026-10-09-landslides':({E,O,Q,N,X,G,T})=>E+row('landslide-design-and-recovery',O+X(),G(),'1fr','1.2fr')+inset('landslide-research',N,'83%')+T()+Q,
 '2026-10-09-nuclear-finance':({E,O,Q,N,A,L,M})=>E+row('nuclear-scale',O,A,'1fr','1.45fr')+field('nuclear-credit-register',L()+row('nuclear-valuation-and-notebook',M(),N,'1.35fr','1fr'),'folio')+Q,
 '2026-10-09-winter-bills':({E,O,Q,N,A,D,L})=>E+field('winter-fixed-equipment',row('winter-forecast-and-choice',A,D(),'1.5fr','1fr'),'gatefold')+row('winter-exposure',O,Q,'1fr','1.3fr')+L()+inset('winter-research',N,'78%'),
 '2026-10-09-climate-liability':({E,O,Q,N,D,T})=>row('liability-institutions',E,O,'1.4fr','1fr')+inset('liability-immediate-decision',D(),'88%','left')+row('liability-evidence-and-research',Q,N,'1.4fr','1fr')+T(),
 '2026-10-16-targeted-power':({E,O,Q,N,A,M})=>E+flo('targeted-identification',A,O+N,'right','62%')+M()+inset('targeted-inference',Q,'86%'),
 '2026-10-16-pfas-agriculture':({E,O,Q,N,G,D,T})=>row('pfas-source-and-recipient',E,O,'1.4fr','1fr')+G()+field('pfas-stock-and-control',row('pfas-choice-and-persistence',D(),T(),'1.4fr','1fr'),'open')+row('pfas-research-and-limits',N,Q,'1fr','1.4fr'),
 '2026-10-16-ferc-review':({E,O,Q,N,D,X,T})=>E+row('ferc-authority-and-tier',O,D(),'1fr','1.6fr')+field('ferc-review-horizons',X()+T(),'folio')+row('ferc-research-and-inference',Q,N,'1.5fr','1fr'),
 '2026-10-16-energy-macro':({E,O,Q,N,A,L,G})=>E+A+L()+row('macro-price-transmission',G(),O+N,'1.4fr','1fr')+Q,
 '2026-10-16-climate-vitals':({E,O,Q,N,X,T})=>E+T()+row('climate-record-and-welfare',O+N,X(),'1fr','1.4fr')+inset('vitals-inference',Q,'90%','left'),
 '2026-10-23-vehicle-mix':({E,O,Q,N,A,T,X})=>flo('vehicle-sales-and-stocks',A,E+O,'right','56%')+T()+row('vehicle-timing-test',N,X(),'1fr','1.35fr')+Q,
 '2026-10-23-emissions-gap':({E,O,Q,N,T,M,G})=>E+field('overshoot-and-persistence',T()+row('overshoot-channel',G(),N,'1.4fr','1fr'),'gatefold')+O+row('overshoot-loss-and-limits',M(),Q,'1.3fr','1fr'),
 '2026-10-23-adaptation-finance':({E,O,Q,N,D,L,G})=>E+inset('adaptation-policy-context',O,'82%')+field('adaptation-allocation',D()+L(),'open')+row('adaptation-additionality',N,G(),'1fr','1.4fr')+Q,
 '2026-10-23-mobility-finance':({E,O,Q,N,A,D})=>row('mobility-credit-opening',E,O,'1.45fr','1fr')+field('mobility-cash-flow',A+inset('mobility-finance-choice',D(),'80%','left'),'folio')+row('mobility-research-and-evidence',N,Q,'1fr','1.3fr'),
 '2026-10-30-household-climate':({E,O,Q,N,M,G,X})=>E+M()+row('household-complementarity',G(),O+Q,'1.5fr','1fr')+field('household-policy-robustness',row('household-test-and-research',X(),N,'1.4fr','1fr'),'ledger'),
 '2026-10-30-solar-storage':({E,O,Q,N,A,T})=>E+flo('solar-project-clock',A,O+N,'left','60%')+T()+inset('solar-project-risk',Q,'85%')
});
module.exports.authored={};
