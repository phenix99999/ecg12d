export interface Record<T> {
    fields: T
    id: number
}

export interface Heure {
    "pk_ID": string,
    "StartDate": string,
    "Minutes": string,
    "Minutes_planifie": string,
    "Description": string,
    "fk_projet": string,
    "fk_activites": string,
    "flag_actif": string,
    "fk_assignation": string,
    "Nom_projet": string,
    "Nom_activite": string,
    "Total_Heures": string,
    "fk_client": string,
    "AM_PM": string,
    "Flag_termine": string,
    "Minutes_restantes": string,
    "Minutes_restantes_tache": string,
    
}

export interface Client {
    pk_ID: string
    Nom: string
}

export interface Account {
    pk_ID: string
    UserAccountName: string
}

export type Type_de_projet = "Budget du total du projet"
    | "Budget du total des budgets d'activités"
    | "Budget par mois"
    | "Pas de budget déterminé"
    | ""

export interface Projet {
    pk_ID: string
    fk_client: string
    Nom: string,
    Type_de_projet: Type_de_projet
}

export interface Activite {
    pk_ID: string
    Nom: string
    fk_projet: string
    fk_client: string
    fk_assignation: string
    Heures_budget: string
    Heures_budget_auto: string
}

