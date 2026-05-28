// voucherInfo mock data for testing and development purposes
import { VoucherInfo } from '../@types/voucher'; // Adjust path based on your architecture

export const MOCK_VOUCHER_INFO: VoucherInfo = {
    batch_code: "IMPE9V417LY9U",
    birth_place: "",
    birthday: "11/15/1959",
    brgy: "006",
    brgy_desc: "BUHANGIN",
    civil_status: null,
    cluster: "FVZ",
    contact_no: "9194136324",
    control_no: "03-77-01-006-000083",
    crop_area: "1.6500",
    description: "2026 Fertilizer Voucher Testing",
    duration_end_date: "2026-06-01 00:00:00",
    duration_start_date: "2026-04-20 00:00:00",
    ext_name: "",
    farm_area: "1.6500",
    first_name: "ZAIDE",
    fund_desc: "RFO3_GAA",
    fund_id: "145ea590-44ce-4bca-b922-d75825a51a6f",
    geo_code: "037701006",
    intervention: "Fertilizer Discount Voucher",
    is_scanned: "1",
    is_special: "0", // Triggers your special rules checks
    last_name: "RITUAL",
    last_scanned_by_id: "c33e5d25-8361-4ab7-b090-788c8e254c7a",
    middle_name: "PALMERO",
    mother_maiden: "",
    mun: "01",
    mun_desc: "BALER Capital",
    one_time_transaction: "0",
    process_type: "VOUCHER",
    prog_code: "FVZ",
    programID: "9cb1b3b9-1753-4b80-a7db-945da9a2ba36",
    program_id: "9cb1b3b9-1753-4b80-a7db-945da9a2ba36",
    proj_code: null,
    prv: "77",
    prv_desc: "AURORA",
    reference_no: "DA1RIYZTS0PE",
    reg: "03",
    reg_desc: "REGION III CENTRAL LUZON",
    reg_farm: "03",
    remitter_id: "FVZ",
    rrp_fertilizer_kind: "",
    rsbsa_no: "03-77-01-006-000083",
    scanned_date: "2026-05-26 17:13:42",
    seed_class: "1",
    sex: "MALE",
    shortname: "FVZ",
    status: "1",
    sub_project: "0",
    title: "2026 Fertilizer Voucher Testing",
    type: "",
    voucherAmountBalance: "3300.00",
    voucherProgramID: "9cb1b3b9-1753-4b80-a7db-945da9a2ba36",
    voucherRemainingBalance: "3300.00",
    voucher_id: "6792b371-3b9f-4a14-acbf-ffffd916c273",
    voucher_status: "NOT YET CLAIMED",

    // 1. Dropdown items structure mapped for your clean Category selector component
    fertilizer_categories: [
        { label: 'Inorganic Fertilizers', value: '1' },
    ],

    // 2. Used to quickly check if a category ID requires secondary selection
    getCheckCategoryHasSubCategory: [
            {
                "fertilizer_category_id": "1"
            },
            {
                "fertilizer_category_id": "6"
            },
            {
                "fertilizer_category_id": "8"
            },
            {
                "fertilizer_category_id": "9"
            },
            {
                "fertilizer_category_id": "10"
            },
            {
                "fertilizer_category_id": "11"
            },
            {
                "fertilizer_category_id": "12"
            },
            {
                "fertilizer_category_id": "13"
            }
        ],

    // 3. Sub-categories bound to their specific master category IDs
    sub_categories: 
    [
        {
            "fertilizer_sub_category_id": "1",
            "fertilizer_category_id": "1",
            "sub_category": "Complete (14-14-14)",
            "program_item_sub_category_id": "2006",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        },
        {
            "fertilizer_sub_category_id": "2",
            "fertilizer_category_id": "1",
            "sub_category": "Complete (16-16-16)",
            "program_item_sub_category_id": "2007",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        },
        {
            "fertilizer_sub_category_id": "3",
            "fertilizer_category_id": "1",
            "sub_category": "Urea - Prilled (46-0-0)",
            "program_item_sub_category_id": "2008",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        },
        {
            "fertilizer_sub_category_id": "4",
            "fertilizer_category_id": "1",
            "sub_category": "Urea - Granular (46-0-0)",
            "program_item_sub_category_id": "2009",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        },
        {
            "fertilizer_sub_category_id": "5",
            "fertilizer_category_id": "1",
            "sub_category": "Ammonium Sulfate (21-0-0)",
            "program_item_sub_category_id": "2010",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        },
        {
            "fertilizer_sub_category_id": "6",
            "fertilizer_category_id": "1",
            "sub_category": "Ammonium Phosphate (16-20-0)",
            "program_item_sub_category_id": "2011",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        },
        {
            "fertilizer_sub_category_id": "7",
            "fertilizer_category_id": "1",
            "sub_category": "Muriate of Potash (0-0-60)",
            "program_item_sub_category_id": "2012",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        },
        {
            "fertilizer_sub_category_id": "8",
            "fertilizer_category_id": "1",
            "sub_category": "Other grades",
            "program_item_sub_category_id": "2013",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        },
        {
            "fertilizer_sub_category_id": "260",
            "fertilizer_category_id": "1",
            "sub_category": "Great Planters 16-16-16 MOP (Agway Chemicals Corporation)",
            "program_item_sub_category_id": "2014",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        },
        {
            "fertilizer_sub_category_id": "268",
            "fertilizer_category_id": "1",
            "sub_category": "SC+ Dolomite Inorganic Fertilizer (Agway Chemicals Corporation)",
            "program_item_sub_category_id": "2015",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        },
        {
            "fertilizer_sub_category_id": "285",
            "fertilizer_category_id": "1",
            "sub_category": "Aljay Fertilizer Ammonium Sulfate 21-0-0 (Aljay Agro-Industrial Solutions, Incorporated)",
            "program_item_sub_category_id": "2016",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        },
        {
            "fertilizer_sub_category_id": "377",
            "fertilizer_category_id": "1",
            "sub_category": "SureGrow Foliar Fertilizer (Best Agri and Agua Farm Solutions and Supply Corporation)",
            "program_item_sub_category_id": "2017",
            "program_id": "9cb1b3b9-1753-4b80-a7db-945da9a2ba36"
        }
    ],

    // 4. Units list structure matching dropdown arrays
    unit_measurements: [
        {
            "label": "Liter (L)",
            "value": "1"
        },
        {
            "label": "Kilo (KG)",
            "value": "2"
        },
        {
            "label": "Gram (G)",
            "value": "3"
        },
        {
            "label": "Milliliter (ML)",
            "value": "4"
        }
    ]
};