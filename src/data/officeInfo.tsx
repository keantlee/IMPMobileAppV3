export interface OfficeBranch {
  office_id: string;
  office_name: string;
  address: string;
  contact: string;
  contact_person: string;
  owner_name: string;
  status: 'Active' | 'Inactive';
  is_main: boolean;
  region: string;
  province: string;
  municipality: string;
}

export const MOCK_OFFICES: OfficeBranch[] = [
  {
    office_id: 'off-001',
    office_name: 'Juan D Agri Supply Main',
    address: 'Brgy. San Isidro, Cabanatuan City, Nueva Ecija',
    contact: '09171234567',
    contact_person: 'Juancho Drake Cruz',
    owner_name: 'Juancho Drake Cruz',
    status: 'Active',
    is_main: true,
    region: 'Region III',
    province: 'Nueva Ecija',
    municipality: 'Cabanatuan City',
  },
  {
    office_id: 'off-002',
    office_name: 'Juan D Agri Supply - Gapan Branch',
    address: 'Brgy. Poblacion, Gapan City, Nueva Ecija',
    contact: '09181234568',
    contact_person: 'Maria Santos',
    owner_name: 'Maria Santos',
    status: 'Active',
    is_main: false,
    region: 'Region III',
    province: 'Nueva Ecija',
    municipality: 'Gapan City',
  },
  {
    office_id: 'off-003',
    office_name: 'Juan D Agri Supply - San Jose Branch',
    address: 'Brgy. Sto. Nino, San Jose City, Nueva Ecija',
    contact: '09191234569',
    contact_person: 'Pedro Reyes',
    owner_name: 'Pedro Reyes',
    status: 'Active',
    is_main: false,
    region: 'Region III',
    province: 'Nueva Ecija',
    municipality: 'San Jose City',
  },
  {
    office_id: 'off-004',
    office_name: 'Juan D Agri Supply - Talavera Branch',
    address: 'Brgy. Poblacion Sur, Talavera, Nueva Ecija',
    contact: '09201234570',
    contact_person: 'Ana Mendoza',
    owner_name: 'Ana Mendoza',
    status: 'Inactive',
    is_main: false,
    region: 'Region III',
    province: 'Nueva Ecija',
    municipality: 'Talavera',
  },
];
