import { useEffect, useRef } from 'react';

const MAP_MARKUP = `
<!-- Sources & filtres pour les POI -->
<div class="fr-py-2w" style="background-color: var(--background-alt-grey);">
  <div class="fr-container">
    <dsfr-data-source id="centres-raw" api-type="opendatasoft"
      base-url="https://data.economie.gouv.fr"
      dataset-id="prix-controle-technique"
      server-side page-size="500">
    </dsfr-data-source>
    <dsfr-data-query id="centres-q" source="centres-raw" server-side></dsfr-data-query>

    <div class="fr-mb-2w">
      <dsfr-data-search source="centres-q" server-search count
        placeholder="Rechercher un centre, une commune..."
        label="Rechercher">
      </dsfr-data-search>
    </div>

    <dsfr-data-facets id="centres-filt" source="centres-q" server-facets
      fields="nom_region,nom_departement,cat_vehicule_libelle,cat_energie_libelle"
      labels="nom_region:Région|nom_departement:Département|cat_vehicule_libelle:Type de véhicule|cat_energie_libelle:Énergie"
      display="nom_region:select|nom_departement:select|cat_vehicule_libelle:multiselect|cat_energie_libelle:multiselect"
      cols="3">
    </dsfr-data-facets>
  </div>
</div>

<!-- Sources choroplèthe (statique, indépendantes des facettes en V1) -->
<dsfr-data-source id="contours" api-type="opendatasoft"
  base-url="https://hub.huwise.com"
  dataset-id="georef-france-departement"
  select="dep_code, dep_name_upper, geo_shape"
  limit="110">
</dsfr-data-source>

<dsfr-data-source id="prix-agg" api-type="opendatasoft"
  base-url="https://data.economie.gouv.fr"
  dataset-id="prix-controle-technique"
  select="round(avg(prix_visite), 1) as prix_moyen, code_departement"
  group-by="code_departement"
  limit="110">
</dsfr-data-source>

<dsfr-data-join id="dept-choro" left="contours" right="prix-agg"
  on="dep_code=code_departement" type="left">
</dsfr-data-join>

<!-- Carte -->
<div class="fr-container fr-py-2w">
  <p class="fr-text--sm fr-hint-text fr-mb-1w">
    Cliquez sur un département ou zoomez pour voir les centres
  </p>
  <dsfr-data-map center="46.6,2.3" zoom="6" height="600px" tiles="osm">
    <dsfr-data-map-layer id="choro" source="dept-choro" type="geoshape"
      geo-field="geo_shape" fill-field="prix_moyen"
      selected-palette="sequentialAscending" fill-opacity="0.6"
      popup-template="<b>{dep_name_upper}</b><br>Prix moyen : {prix_moyen} €"
      max-zoom="8">
    </dsfr-data-map-layer>

    <dsfr-data-map-layer id="poi" source="centres-filt" type="marker"
      lat-field="latitude" lon-field="longitude"
      tooltip-field="cct_denomination"
      min-zoom="9" bbox cluster max-items="2000">
    </dsfr-data-map-layer>

    <dsfr-data-map-popup for="poi" mode="panel-left"
      title-field="cct_denomination" width="380px">
      <template>
        <p class="fr-badge fr-badge--info fr-badge--sm">Prix de référence</p>
        <p class="fr-display--xs fr-mb-1w">{{prix_visite|—}} €</p>
        <p class="fr-text--sm fr-hint-text">SIRET : {{cct_siret|—}}</p>

        <h5 class="fr-mt-3w fr-mb-1w">Adresse</h5>
        <p class="fr-mb-1w">
          {{cct_adresse|—}}<br>
          {{cct_code_postal}} {{cct_commune}}<br>
          {{nom_departement}} ({{code_departement}})
        </p>

        <h5 class="fr-mt-3w fr-mb-1w">Contact</h5>
        <p class="fr-mb-1w">Tél : <a href="tel:{{cct_tel}}">{{cct_tel|—}}</a></p>
        <p><a href="{{cct_url}}" target="_blank" rel="noopener noreferrer">Site web</a></p>
      </template>
    </dsfr-data-map-popup>
  </dsfr-data-map>
</div>
`;

export function CarteV2Page() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || host.innerHTML.trim()) return;
    host.innerHTML = MAP_MARKUP;
  }, []);

  return (
    <>
      <div className="fr-container">
        <h1 className="fr-py-2w fr-mb-0">Carte des centres (V2 — ChartsBuilder)</h1>
      </div>
      <div ref={ref} />
    </>
  );
}
