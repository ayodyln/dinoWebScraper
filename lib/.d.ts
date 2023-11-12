type DinosaurObject = {
  id: string;
  name: string;
  img: string[];
  pronounciation: string;
  name_meaning: string;
  type: string;
  diet: string;
  length: string;
  era: Era;
  location: string;
  description: string;
  taxonomic_details: Taxonomy;
};

type Era = {
  period: string;
  epoch: string;
};

type Taxonomy = {
  taxonomy: string[];
  named_by: string;
  type_species: string;
};

export { DinosaurObject, Taxonomy, Era };
