export const perfumeIcon = `<svg viewBox="0 0 32 36" fill="none" aria-hidden="true"><rect x="7" y="13" width="18" height="20" rx="4" stroke="currentColor" stroke-width="1.5"/><path d="M12 13V8h8v5M11 3h10v5H11zM12 24h8M16 20v8M24 4l4-2M25 8h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
export function botanical(note) {
  const forms={
    citrus:'<circle cx="23" cy="26" r="12" fill="currentColor" opacity=".22"/><circle cx="23" cy="26" r="11"/><circle cx="23" cy="26" r="8"/><path d="M23 18v16M15 26h16M17 20l12 12m0-12L17 32M25 12q4-9 13-5-4 8-13 5Z"/>',
    flower:Array.from({length:5},(_,i)=>`<ellipse cx="24" cy="15" rx="5" ry="9" transform="rotate(${i*72} 24 24)" fill="currentColor" fill-opacity=".16"/>`).join('')+'<circle cx="24" cy="24" r="3" fill="currentColor"/><path d="M24 31v12m0-5q7-7 13-4-5 6-13 4Z"/>',
    rose:'<path d="M24 8c-9-8-19 4-12 10-9 6-3 19 7 15 5 8 18 2 14-7 9-5 6-19-4-17-2-2-4-2-5-1Z" fill="currentColor" fill-opacity=".13"/><path d="M24 10c-10 0-10 16 0 15 8-1 7-11 1-12-5-1-8 6-2 8m-8-6q-4 12 9 16 9 1 10-9M24 34v10m0-5q-10-8-13-3 6 5 13 3Z"/>',
    sprig:'<path d="M22 44 28 5M25 14C11 3 14 19 25 20m1-3c12-9 13 5-1 8m-1 0C9 14 12 32 23 30m1-1c16-10 17 7-1 8" fill="currentColor" fill-opacity=".17"/>',
    leaf:'<path d="M10 40C9 17 20 9 39 6c-2 25-13 37-29 34Z" fill="currentColor" fill-opacity=".22"/><path d="m9 43 26-32M15 35l-2-11m8 5 13-1m-7-6-1-10"/>',
    pear:'<path d="M21 13c-6 0-4 9-10 17-9 15 22 21 25 7 2-10-7-14-8-22-1-3-4-4-7-2Z" fill="currentColor" fill-opacity=".25"/><path d="M24 14q-4-6 0-11m1 9q10-10 15-4-7 6-15 4Z"/>',
    fruit:'<path d="M23 14c-18-7-22 19-11 25 6 4 9 1 12 1s9 3 15-3c9-10 0-29-13-23Z" fill="currentColor" fill-opacity=".23"/><path d="M24 15 27 4M25 12q9-12 16-5-5 8-16 5Z"/>',
    cherry:'<circle cx="16" cy="31" r="10" fill="currentColor" fill-opacity=".3"/><circle cx="34" cy="33" r="9" fill="currentColor" fill-opacity=".24"/><path d="M16 21Q29 16 28 4q-1 13 6 20M28 6q-12-7-15 0 6 7 15 0"/>',
    seed:'<ellipse cx="19" cy="23" rx="8" ry="14" transform="rotate(30 19 23)" fill="currentColor" fill-opacity=".3"/><ellipse cx="33" cy="30" rx="7" ry="11" transform="rotate(-24 33 30)" fill="currentColor" fill-opacity=".16"/><path d="m24 11-10 23m15-14 7 18"/>',
    spice:'<path d="m24 5 4 12 13-3-8 10 9 10-14-1-4 12-5-12-12 3 7-12L6 13l14 3Z" fill="currentColor" fill-opacity=".2"/><circle cx="24" cy="24" r="5"/>',
    spark:'<path d="M24 8q2 14 14 16-12 2-14 16-2-14-14-16 12-2 14-16Z" fill="currentColor" fill-opacity=".15"/><circle cx="8" cy="8" r="2"/><circle cx="40" cy="38" r="3"/><path d="M36 4v8m-4-4h8"/>',
    berries:'<path d="M24 8v19m0-11q-8-11-15-6 5 7 15 6m0 3q9-13 16-7-4 7-16 7"/><circle cx="18" cy="29" r="6" fill="currentColor" fill-opacity=".23"/><circle cx="30" cy="29" r="6" fill="currentColor" fill-opacity=".3"/><circle cx="24" cy="38" r="6" fill="currentColor" fill-opacity=".18"/>',
    wood:'<path d="m9 32 22-23 10 9-23 23Z" fill="currentColor" fill-opacity=".2"/><ellipse cx="14" cy="37" rx="7" ry="5" transform="rotate(40 14 37)"/><path d="m14 31 19-19M22 35l15-16m-21 9 8-8"/>',
    pod:'<path d="M10 39Q22 31 33 7q4-4 2 2-2 22-23 33-5 3-2-3ZM18 42Q36 32 40 10" fill="currentColor" fill-opacity=".2"/><path d="M8 18q9 1 11-8 2 9 11 10-9 1-11 9-2-9-11-11Z"/>',
    drop:'<path d="M24 6C22 17 11 23 11 32a13 13 0 0 0 26 0C37 23 27 16 24 6Z" fill="currentColor" fill-opacity=".25"/><path d="M17 30q-1 8 7 9"/>',
    stone:'<path d="m13 12 17-6 12 20-9 15-20-2-7-13Z" fill="currentColor" fill-opacity=".18"/><path d="m13 12 11 13L6 26m18-1 18 1M24 25l9 16m-9-16 6-19"/>',
  };
  return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${forms[note.icon]||forms.flower}</svg>`;
}
export const bottle = `<svg class="bottle-svg" viewBox="0 0 400 560" role="img" aria-label="Flacon de parfum en verre, rempli au fil des notes choisies">
<defs>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2=".14"><stop stop-color="#80643a" stop-opacity=".26"/><stop offset=".05" stop-color="#fff" stop-opacity=".85"/><stop offset=".12" stop-color="#a79064" stop-opacity=".12"/><stop offset=".34" stop-color="#fff" stop-opacity=".05"/><stop offset=".79" stop-color="#e2d8bd" stop-opacity=".24"/><stop offset=".94" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#76613e" stop-opacity=".28"/></linearGradient>
  <linearGradient id="liquid" x1="0" y1="0" x2=".75" y2="1"><stop stop-color="var(--juice)" stop-opacity=".34"/><stop offset=".75" stop-color="var(--juice)" stop-opacity=".7"/><stop offset="1" stop-color="var(--juice)" stop-opacity=".91"/></linearGradient>
  <linearGradient id="gold"><stop stop-color="#71623b"/><stop offset=".15" stop-color="#e8d4a0"/><stop offset=".35" stop-color="#b9a26a"/><stop offset=".64" stop-color="#f7e5b2"/><stop offset=".85" stop-color="#aa8e52"/><stop offset="1" stop-color="#665132"/></linearGradient>
  <linearGradient id="cap"><stop stop-color="#1f2525"/><stop offset=".22" stop-color="#49433a"/><stop offset=".3" stop-color="#282b28"/><stop offset=".8" stop-color="#282a26"/><stop offset=".95" stop-color="#4d493d"/><stop offset="1" stop-color="#202621"/></linearGradient>
  <linearGradient id="base" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a98f5f" stop-opacity=".4"/><stop offset=".35" stop-color="#fff" stop-opacity=".8"/><stop offset=".7" stop-color="#a58c61" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity=".8"/></linearGradient>
  <radialGradient id="shadow"><stop stop-color="#554328" stop-opacity=".26"/><stop offset="1" stop-color="#554328" stop-opacity="0"/></radialGradient>
  <clipPath id="inside"><path d="M100 239Q100 213 150 191L173 184h54l23 7q50 22 50 48v234q0 15-15 15H115q-15 0-15-15Z"/></clipPath>
</defs>
<ellipse cx="203" cy="518" rx="172" ry="23" fill="url(#shadow)"/>
<path d="M183 180h34v10h-34Z" fill="url(#gold)"/><rect x="164" y="154" width="72" height="32" rx="4" fill="url(#gold)"/><path d="M172 161h55m-55 6h55m-55 6h55" stroke="#806744" opacity=".4"/>
<g class="bottle-cap"><rect x="148" y="59" width="104" height="95" rx="6" fill="url(#cap)"/><ellipse cx="200" cy="62" rx="49" ry="7" fill="#514b3e"/><ellipse cx="200" cy="62" rx="42" ry="4" fill="#35382f"/><rect x="148" y="141" width="104" height="7" fill="url(#gold)"/><path d="M155 75v59m89-58v58" stroke="#ded0ab" opacity=".15"/></g>
<path d="M91 238Q91 211 140 190l25-11h70l25 11q49 21 49 48v248q0 20-20 20H111q-20 0-20-20Z" fill="url(#glass)" stroke="#b0a287" stroke-opacity=".5"/>
<g clip-path="url(#inside)"><rect class="perfume-liquid" x="99" y="470" width="202" height="340" fill="url(#liquid)"/><ellipse class="liquid-surface" cx="200" cy="470" rx="101" ry="6" fill="var(--juice)" opacity=".5"/><path d="M200 186v285" stroke="#96815f" stroke-opacity=".25" stroke-width="3"/><path d="M202 186v285" stroke="#fff" stroke-opacity=".45"/></g>
<path d="M97 247q0-20 43-40l28-14M303 248q0-20-45-40l-27-14" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="3"/>
<path d="M100 256v220q0 13 13 13h174q14 0 14-13V257" fill="none" stroke="#a5916c" stroke-opacity=".3"/>
<path d="M104 251v225m5-225v225m184-225v225" stroke="#fff" stroke-width="2" opacity=".7"/>
<rect x="96" y="488" width="208" height="13" rx="4" fill="url(#base)"/><path d="M106 497h188" stroke="#fff" opacity=".8"/>
<g class="flacon-label"><rect x="128" y="286" width="144" height="155" rx="1" fill="#f6f0e3" stroke="#bca77b" stroke-width=".6"/><rect x="134" y="292" width="132" height="143" fill="none" stroke="#d3c6a8" stroke-width=".6"/><text x="200" y="318" text-anchor="middle" fill="#a38a57" font-size="8" letter-spacing="3" font-family="DM Sans,sans-serif">L’ATELIER</text><text x="200" y="365" text-anchor="middle" fill="#423c31" font-size="46" font-family="Cormorant Garamond,Georgia,serif">N°08</text><path d="M172 382h56" stroke="#b8a581" stroke-width=".5"/><text x="200" y="405" text-anchor="middle" fill="#706449" font-size="7" letter-spacing="2" font-family="DM Sans,sans-serif">EAU D’IMAGINATION</text><text id="bottle-notes" x="200" y="421" text-anchor="middle" fill="#9a8e74" font-size="6" letter-spacing="1" font-family="DM Sans,sans-serif">UNE PAGE BLANCHE</text></g>
<path d="M91 265q14 0 15 15v165q-2 28-12 27" fill="#fff" opacity=".18"/><path d="M280 261q10-4 17-8v215q-7 12-17 5Z" fill="#fff" opacity=".18"/>
</svg>`;
