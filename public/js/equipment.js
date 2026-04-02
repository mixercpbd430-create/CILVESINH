// Equipment master data with cleaning instructions
const EQUIPMENT_LIST = [
  // ==================== LINE: MIXER ====================
  {
    id: 'mixer-519',
    name: 'Mixer',
    code: '519',
    category: 'Trộn',
    line: 'Mixer',
    instructions: [
      'Tắt nguồn điện và khóa an toàn trước khi vệ sinh',
      'Mở nắp mixer, dùng chổi quét sạch nguyên liệu còn bám bên trong',
      'Dùng khí nén thổi sạch các góc khuất và khe hở',
      'Lau sạch cánh trộn và thành trong bằng khăn ẩm',
      'Kiểm tra seal cửa xả, vệ sinh sạch bụi bám',
      'Đóng nắp, kiểm tra lại trước khi vận hành'
    ]
  },
  {
    id: 'blender-534',
    name: 'Blender',
    code: '534',
    category: 'Trộn',
    line: 'Mixer',
    instructions: [
      'Ngắt điện, đảm bảo máy dừng hoàn toàn',
      'Mở cửa kiểm tra, quét sạch nguyên liệu tồn đọng',
      'Dùng khí nén thổi sạch bên trong buồng trộn',
      'Vệ sinh cánh trộn, trục quay bằng khăn sạch',
      'Kiểm tra và vệ sinh cửa nạp, cửa xả',
      'Đóng cửa, kiểm tra an toàn trước khi khởi động'
    ]
  },
  {
    id: 'cleaner-536',
    name: 'Cleaner',
    code: '536',
    category: 'Sàng lọc',
    line: 'Mixer',
    instructions: [
      'Tắt nguồn và chờ máy dừng hẳn',
      'Tháo lưới sàng, vệ sinh sạch sẽ',
      'Dùng chổi và khí nén làm sạch khung sàng',
      'Kiểm tra lưới sàng có bị rách hoặc hỏng không',
      'Lắp lại lưới sàng đúng vị trí',
      'Vệ sinh bên ngoài máy và khu vực xung quanh'
    ]
  },
  {
    id: 'namcham-523',
    name: 'Nam châm',
    code: '523',
    category: 'Lọc',
    line: 'Mixer',
    instructions: [
      'Ngắt điện an toàn',
      'Rút thanh nam châm ra khỏi hộp',
      'Dùng khăn sạch lau sạch kim loại bám trên thanh nam châm',
      'Vệ sinh bên trong hộp chứa nam châm',
      'Kiểm tra lực hút nam châm',
      'Lắp lại thanh nam châm đúng vị trí'
    ]
  },
  {
    id: 'hopper-521',
    name: 'Hopper',
    code: '521',
    category: 'Chứa',
    line: 'Mixer',
    instructions: [
      'Đảm bảo hopper đã xả hết nguyên liệu',
      'Mở cửa kiểm tra bên trong',
      'Dùng chổi quét sạch thành và đáy hopper',
      'Thổi khí nén vào các góc khó tiếp cận',
      'Kiểm tra van xả hoạt động tốt',
      'Đóng cửa và ghi nhận tình trạng'
    ]
  },
  {
    id: 'dausen-522',
    name: 'Đầu sên',
    code: '522',
    category: 'Vận chuyển',
    line: 'Mixer',
    instructions: [
      'Tắt nguồn điện, khóa an toàn',
      'Mở nắp đầu sên',
      'Quét sạch nguyên liệu tồn đọng bên trong',
      'Kiểm tra tình trạng bạt sên (cánh gạt)',
      'Dùng khí nén thổi sạch',
      'Đóng nắp và siết chặt bu lông'
    ]
  },
  {
    id: 'hongxuongchangau-523',
    name: 'Họng xuống chân gàu',
    code: '523',
    category: 'Vận chuyển',
    line: 'Mixer',
    instructions: [
      'Ngắt điện thiết bị liên quan',
      'Mở cửa kiểm tra họng xuống',
      'Quét sạch nguyên liệu bám dính',
      'Dùng khí nén thổi sạch bên trong ống',
      'Kiểm tra không bị tắc nghẽn',
      'Đóng cửa kiểm tra'
    ]
  },
  {
    id: 'changau-523',
    name: 'Chân gàu',
    code: '523',
    category: 'Vận chuyển',
    line: 'Mixer',
    instructions: [
      'Tắt gàu tải, khóa an toàn',
      'Mở cửa kiểm tra chân gàu',
      'Vệ sinh sạch nguyên liệu tồn đọng ở đáy',
      'Kiểm tra dây curoa và gàu múc',
      'Dùng khí nén làm sạch',
      'Đóng cửa và kiểm tra bu lông'
    ]
  },
  {
    id: 'daugau-523',
    name: 'Đầu gàu',
    code: '523',
    category: 'Vận chuyển',
    line: 'Mixer',
    instructions: [
      'Ngắt điện và khóa an toàn',
      'Mở nắp đầu gàu',
      'Vệ sinh sạch nguyên liệu bám trên bánh dẫn',
      'Kiểm tra độ căng dây curoa',
      'Thổi sạch bụi bằng khí nén',
      'Đóng nắp và siết chặt'
    ]
  },
  {
    id: 'sen-527',
    name: 'Sên',
    code: '527',
    category: 'Vận chuyển',
    line: 'Mixer',
    instructions: [
      'Tắt nguồn sên tải',
      'Mở nắp kiểm tra dọc theo thân sên',
      'Quét sạch nguyên liệu tồn đọng',
      'Kiểm tra cánh gạt sên có bị mòn không',
      'Dùng khí nén thổi sạch toàn bộ',
      'Đóng nắp và kiểm tra'
    ]
  },
  {
    id: 'hongxuongsen-527',
    name: 'Họng xuống sên',
    code: '527',
    category: 'Vận chuyển',
    line: 'Mixer',
    instructions: [
      'Ngắt điện thiết bị',
      'Mở cửa kiểm tra họng xuống',
      'Vệ sinh sạch nguyên liệu bám dính bên trong',
      'Kiểm tra không bị tắc',
      'Thổi sạch bằng khí nén',
      'Đóng cửa và ghi nhận'
    ]
  },
  {
    id: 'flapbox-528',
    name: 'Flapbox',
    code: '528',
    category: 'Phân phối',
    line: 'Mixer',
    instructions: [
      'Tắt nguồn điện',
      'Mở nắp flapbox',
      'Vệ sinh sạch van chuyển hướng (flap)',
      'Quét sạch nguyên liệu tồn đọng',
      'Kiểm tra cơ cấu đóng mở van',
      'Đóng nắp và kiểm tra hoạt động'
    ]
  },
  {
    id: 'hopper-530',
    name: 'Hopper',
    code: '530',
    category: 'Chứa',
    line: 'Mixer',
    instructions: [
      'Xả hết nguyên liệu trong hopper',
      'Mở cửa kiểm tra bên trong',
      'Quét sạch thành và đáy',
      'Thổi khí nén làm sạch góc khuất',
      'Kiểm tra van xả và sensor',
      'Đóng cửa, ghi nhận tình trạng'
    ]
  },
  {
    id: 'vittai-531',
    name: 'Vít tải',
    code: '531',
    category: 'Vận chuyển',
    line: 'Mixer',
    instructions: [
      'Tắt nguồn vít tải',
      'Mở nắp kiểm tra',
      'Quét sạch nguyên liệu bám trên trục vít',
      'Kiểm tra tình trạng cánh vít',
      'Dùng khí nén thổi sạch toàn bộ máng',
      'Đóng nắp và siết chặt bu lông'
    ]
  },
  {
    id: 'sentai-533',
    name: 'Sên tải',
    code: '533',
    category: 'Vận chuyển',
    line: 'Mixer',
    instructions: [
      'Ngắt điện sên tải',
      'Mở nắp dọc theo thân sên',
      'Vệ sinh sạch nguyên liệu tồn đọng',
      'Kiểm tra cánh gạt và xích tải',
      'Thổi sạch bằng khí nén',
      'Đóng nắp và kiểm tra an toàn'
    ]
  },
  {
    id: 'flapbox-535',
    name: 'Flapbox',
    code: '535',
    category: 'Phân phối',
    line: 'Mixer',
    instructions: [
      'Tắt nguồn điện',
      'Mở nắp flapbox',
      'Vệ sinh van chuyển hướng',
      'Quét sạch nguyên liệu bên trong',
      'Kiểm tra cơ cấu đóng mở',
      'Đóng nắp và vận hành thử'
    ]
  },
  {
    id: 'dautrucmaysang-536',
    name: 'Đầu trục máy sàng',
    code: '536',
    category: 'Sàng lọc',
    line: 'Mixer',
    instructions: [
      'Tắt máy sàng hoàn toàn',
      'Mở nắp đầu trục',
      'Vệ sinh sạch bụi và nguyên liệu bám',
      'Kiểm tra ổ bi và trục quay',
      'Dùng khí nén thổi sạch',
      'Đóng nắp và kiểm tra'
    ]
  },
  {
    id: 'vittai-536.5',
    name: 'Vít tải',
    code: '536.5',
    category: 'Vận chuyển',
    line: 'Mixer',
    instructions: [
      'Ngắt nguồn điện',
      'Mở nắp kiểm tra vít tải',
      'Quét sạch nguyên liệu trên trục và cánh vít',
      'Kiểm tra mài mòn cánh vít',
      'Thổi sạch bằng khí nén',
      'Đóng nắp, siết bu lông'
    ]
  },
  {
    id: 'flapbox-537',
    name: 'Flapbox',
    code: '537',
    category: 'Phân phối',
    line: 'Mixer',
    instructions: [
      'Tắt nguồn điện',
      'Mở nắp flapbox',
      'Vệ sinh van và buồng chứa',
      'Quét sạch nguyên liệu tồn đọng',
      'Kiểm tra hoạt động van',
      'Đóng nắp và kiểm tra'
    ]
  },
  {
    id: 'flapbox-537.5',
    name: 'Flapbox',
    code: '537.5',
    category: 'Phân phối',
    line: 'Mixer',
    instructions: [
      'Ngắt điện an toàn',
      'Mở nắp kiểm tra',
      'Vệ sinh sạch van chuyển hướng',
      'Quét sạch bên trong',
      'Kiểm tra cơ cấu vận hành',
      'Đóng nắp và ghi nhận'
    ]
  },
  {
    id: 'flapbox-537.51',
    name: 'Flapbox',
    code: '537.51',
    category: 'Phân phối',
    line: 'Mixer',
    instructions: [
      'Tắt nguồn điện',
      'Mở nắp flapbox',
      'Làm sạch van và thành trong',
      'Quét dọn nguyên liệu tồn đọng',
      'Kiểm tra vận hành van',
      'Đóng nắp và siết chặt'
    ]
  },
  {
    id: 'sen-538.5',
    name: 'Sên',
    code: '538.5',
    category: 'Vận chuyển',
    line: 'Mixer',
    instructions: [
      'Tắt nguồn sên tải',
      'Mở nắp kiểm tra',
      'Quét sạch nguyên liệu tồn đọng trong máng',
      'Kiểm tra cánh gạt và xích',
      'Dùng khí nén thổi sạch',
      'Đóng nắp và kiểm tra an toàn'
    ]
  },
  {
    id: 'hongxuongsen-538.5',
    name: 'Họng xuống sên',
    code: '538.5',
    category: 'Vận chuyển',
    line: 'Mixer',
    instructions: [
      'Ngắt điện thiết bị',
      'Mở cửa họng xuống',
      'Vệ sinh sạch nguyên liệu bám dính',
      'Kiểm tra lưu lượng không bị tắc',
      'Thổi sạch bằng khí nén',
      'Đóng cửa và kiểm tra'
    ]
  },
  {
    id: 'ongtre-dauquay-550',
    name: 'Đoạn ống trên đầu quay',
    code: '550',
    category: 'Ống dẫn',
    line: 'Mixer',
    instructions: [
      'Ngắt nguồn thiết bị liên quan',
      'Tháo kẹp nối ống (nếu có)',
      'Dùng chổi dài vệ sinh bên trong ống',
      'Thổi khí nén qua ống để loại bỏ cặn bám',
      'Kiểm tra bên trong ống không bị tắc',
      'Lắp lại và siết chặt kẹp nối'
    ]
  },
  {
    id: 'ongtro-dauquay-550',
    name: 'Đoạn ống trong đầu quay',
    code: '550',
    category: 'Ống dẫn',
    line: 'Mixer',
    instructions: [
      'Ngắt nguồn an toàn',
      'Mở cửa kiểm tra đầu quay',
      'Vệ sinh bên trong ống dẫn',
      'Dùng khí nén thổi sạch cặn nguyên liệu',
      'Kiểm tra tình trạng ống và khớp nối',
      'Đóng cửa và kiểm tra'
    ]
  },
  {
    id: 'ongtre-dauquay-538',
    name: 'Đoạn ống trên đầu quay',
    code: '538',
    category: 'Ống dẫn',
    line: 'Mixer',
    instructions: [
      'Tắt nguồn thiết bị',
      'Tháo kẹp nối ống',
      'Dùng chổi dài vệ sinh bên trong',
      'Thổi khí nén làm sạch',
      'Kiểm tra ống không bị hư hỏng',
      'Lắp lại và siết chặt'
    ]
  },
  {
    id: 'ongtro-dauquay-538',
    name: 'Đoạn ống trong đầu quay',
    code: '538',
    category: 'Ống dẫn',
    line: 'Mixer',
    instructions: [
      'Ngắt nguồn an toàn',
      'Mở kiểm tra đầu quay',
      'Vệ sinh bên trong ống',
      'Dùng khí nén thổi sạch',
      'Kiểm tra khớp nối và seal',
      'Đóng cửa và ghi nhận'
    ]
  },
  {
    id: 'ongtro-dauquay-548',
    name: 'Đoạn ống trong đầu quay',
    code: '548',
    category: 'Ống dẫn',
    line: 'Mixer',
    instructions: [
      'Ngắt nguồn điện an toàn',
      'Mở cửa kiểm tra đầu quay',
      'Vệ sinh sạch bên trong ống dẫn',
      'Thổi khí nén loại bỏ cặn bám',
      'Kiểm tra tình trạng ống và khớp nối',
      'Đóng cửa, siết chặt và ghi nhận'
    ]
  },

  // ==================== LINE: INTAKE ====================
  {
    id: 'filter-ham-intake-1',
    name: 'Filter hầm intake 1',
    code: 'I-01',
    category: 'Lọc',
    line: 'Intake',
    instructions: [
      'Tắt nguồn điện và khóa an toàn',
      'Tháo nắp filter để kiểm tra',
      'Vệ sinh sạch bụi và cặn bám trên lưới lọc',
      'Dùng khí nén thổi sạch toàn bộ filter',
      'Kiểm tra lưới lọc có bị hỏng không',
      'Lắp lại và đóng nắp'
    ]
  },
  {
    id: 'filter-ham-intake-2',
    name: 'Filter hầm intake 2',
    code: 'I-02',
    category: 'Lọc',
    line: 'Intake',
    instructions: [
      'Tắt nguồn điện và khóa an toàn',
      'Tháo nắp filter để kiểm tra',
      'Vệ sinh sạch bụi và cặn bám trên lưới lọc',
      'Dùng khí nén thổi sạch toàn bộ filter',
      'Kiểm tra lưới lọc có bị hỏng không',
      'Lắp lại và đóng nắp'
    ]
  },
  {
    id: 'filter-ham-intake-3',
    name: 'Filter hầm intake 3',
    code: 'I-03',
    category: 'Lọc',
    line: 'Intake',
    instructions: [
      'Tắt nguồn điện và khóa an toàn',
      'Tháo nắp filter để kiểm tra',
      'Vệ sinh sạch bụi và cặn bám trên lưới lọc',
      'Dùng khí nén thổi sạch toàn bộ filter',
      'Kiểm tra lưới lọc có bị hỏng không',
      'Lắp lại và đóng nắp'
    ]
  },
  {
    id: 'sentai-566',
    name: 'Sên tải',
    code: '566',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện sên tải',
      'Mở nắp dọc theo thân sên',
      'Vệ sinh sạch nguyên liệu tồn đọng',
      'Kiểm tra cánh gạt và xích tải',
      'Thổi sạch bằng khí nén',
      'Đóng nắp và kiểm tra an toàn'
    ]
  },
  {
    id: 'sentai-192',
    name: 'Sên tải',
    code: '192',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện sên tải',
      'Mở nắp dọc theo thân sên',
      'Vệ sinh sạch nguyên liệu tồn đọng',
      'Kiểm tra cánh gạt và xích tải',
      'Thổi sạch bằng khí nén',
      'Đóng nắp và kiểm tra an toàn'
    ]
  },
  {
    id: 'sentai-182',
    name: 'Sên tải',
    code: '182',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện sên tải',
      'Mở nắp dọc theo thân sên',
      'Vệ sinh sạch nguyên liệu tồn đọng',
      'Kiểm tra cánh gạt và xích tải',
      'Thổi sạch bằng khí nén',
      'Đóng nắp và kiểm tra an toàn'
    ]
  },
  {
    id: 'hongxuongchangau-567',
    name: 'Họng xuống chân gàu',
    code: '567',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện thiết bị liên quan',
      'Mở cửa kiểm tra họng xuống',
      'Quét sạch nguyên liệu bám dính',
      'Dùng khí nén thổi sạch bên trong ống',
      'Kiểm tra không bị tắc nghẽn',
      'Đóng cửa kiểm tra'
    ]
  },
  {
    id: 'hongxuongchangau-192',
    name: 'Họng xuống chân gàu',
    code: '192',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện thiết bị liên quan',
      'Mở cửa kiểm tra họng xuống',
      'Quét sạch nguyên liệu bám dính',
      'Dùng khí nén thổi sạch bên trong ống',
      'Kiểm tra không bị tắc nghẽn',
      'Đóng cửa kiểm tra'
    ]
  },
  {
    id: 'hongxuongchangau-182',
    name: 'Họng xuống chân gàu',
    code: '182',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện thiết bị liên quan',
      'Mở cửa kiểm tra họng xuống',
      'Quét sạch nguyên liệu bám dính',
      'Dùng khí nén thổi sạch bên trong ống',
      'Kiểm tra không bị tắc nghẽn',
      'Đóng cửa kiểm tra'
    ]
  },
  {
    id: 'changau-567',
    name: 'Chân gàu',
    code: '567',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Tắt gàu tải, khóa an toàn',
      'Mở cửa kiểm tra chân gàu',
      'Vệ sinh sạch nguyên liệu tồn đọng ở đáy',
      'Kiểm tra dây curoa và gàu múc',
      'Dùng khí nén làm sạch',
      'Đóng cửa và kiểm tra bu lông'
    ]
  },
  {
    id: 'changau-193',
    name: 'Chân gàu',
    code: '193',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Tắt gàu tải, khóa an toàn',
      'Mở cửa kiểm tra chân gàu',
      'Vệ sinh sạch nguyên liệu tồn đọng ở đáy',
      'Kiểm tra dây curoa và gàu múc',
      'Dùng khí nén làm sạch',
      'Đóng cửa và kiểm tra bu lông'
    ]
  },
  {
    id: 'changau-183',
    name: 'Chân gàu',
    code: '183',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Tắt gàu tải, khóa an toàn',
      'Mở cửa kiểm tra chân gàu',
      'Vệ sinh sạch nguyên liệu tồn đọng ở đáy',
      'Kiểm tra dây curoa và gàu múc',
      'Dùng khí nén làm sạch',
      'Đóng cửa và kiểm tra bu lông'
    ]
  },
  {
    id: 'salcurb-182',
    name: 'Hệ thống phun Salcurb ở sên 182',
    code: '182-S',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Tắt nguồn hệ thống phun',
      'Kiểm tra và vệ sinh đầu phun Salcurb',
      'Vệ sinh ống dẫn và van điều khiển',
      'Kiểm tra không bị tắc nghẽn',
      'Lau sạch bên ngoài hệ thống',
      'Kiểm tra lại trước khi vận hành'
    ]
  },
  {
    id: 'daugau-576',
    name: 'Đầu gàu',
    code: '576',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện và khóa an toàn',
      'Mở nắp đầu gàu',
      'Vệ sinh sạch nguyên liệu bám trên bánh dẫn',
      'Kiểm tra độ căng dây curoa',
      'Thổi sạch bụi bằng khí nén',
      'Đóng nắp và siết chặt'
    ]
  },
  {
    id: 'daugau-193',
    name: 'Đầu gàu',
    code: '193',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện và khóa an toàn',
      'Mở nắp đầu gàu',
      'Vệ sinh sạch nguyên liệu bám trên bánh dẫn',
      'Kiểm tra độ căng dây curoa',
      'Thổi sạch bụi bằng khí nén',
      'Đóng nắp và siết chặt'
    ]
  },
  {
    id: 'daugau-183',
    name: 'Đầu gàu',
    code: '183',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện và khóa an toàn',
      'Mở nắp đầu gàu',
      'Vệ sinh sạch nguyên liệu bám trên bánh dẫn',
      'Kiểm tra độ căng dây curoa',
      'Thổi sạch bụi bằng khí nén',
      'Đóng nắp và siết chặt'
    ]
  },
  {
    id: 'hongxuongdaugau-567',
    name: 'Họng xuống đầu gàu',
    code: '567',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện thiết bị liên quan',
      'Mở cửa kiểm tra họng xuống',
      'Quét sạch nguyên liệu bám dính',
      'Dùng khí nén thổi sạch bên trong',
      'Kiểm tra không bị tắc nghẽn',
      'Đóng cửa và ghi nhận'
    ]
  },
  {
    id: 'hongxuongdaugau-193',
    name: 'Họng xuống đầu gàu',
    code: '193',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện thiết bị liên quan',
      'Mở cửa kiểm tra họng xuống',
      'Quét sạch nguyên liệu bám dính',
      'Dùng khí nén thổi sạch bên trong',
      'Kiểm tra không bị tắc nghẽn',
      'Đóng cửa và ghi nhận'
    ]
  },
  {
    id: 'hongxuongdaugau-183',
    name: 'Họng xuống đầu gàu',
    code: '183',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện thiết bị liên quan',
      'Mở cửa kiểm tra họng xuống',
      'Quét sạch nguyên liệu bám dính',
      'Dùng khí nén thổi sạch bên trong',
      'Kiểm tra không bị tắc nghẽn',
      'Đóng cửa và ghi nhận'
    ]
  },
  {
    id: 'sentai-569',
    name: 'Sên tải',
    code: '569',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện sên tải',
      'Mở nắp dọc theo thân sên',
      'Vệ sinh sạch nguyên liệu tồn đọng',
      'Kiểm tra cánh gạt và xích tải',
      'Thổi sạch bằng khí nén',
      'Đóng nắp và kiểm tra an toàn'
    ]
  },
  {
    id: 'sentai-195',
    name: 'Sên tải',
    code: '195',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện sên tải',
      'Mở nắp dọc theo thân sên',
      'Vệ sinh sạch nguyên liệu tồn đọng',
      'Kiểm tra cánh gạt và xích tải',
      'Thổi sạch bằng khí nén',
      'Đóng nắp và kiểm tra an toàn'
    ]
  },
  {
    id: 'sentai-185',
    name: 'Sên tải',
    code: '185',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện sên tải',
      'Mở nắp dọc theo thân sên',
      'Vệ sinh sạch nguyên liệu tồn đọng',
      'Kiểm tra cánh gạt và xích tải',
      'Thổi sạch bằng khí nén',
      'Đóng nắp và kiểm tra an toàn'
    ]
  },
  {
    id: 'hongxuongsentai-569',
    name: 'Họng xuống sên tải',
    code: '569',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện thiết bị',
      'Mở cửa kiểm tra họng xuống',
      'Vệ sinh sạch nguyên liệu bám dính bên trong',
      'Kiểm tra không bị tắc',
      'Thổi sạch bằng khí nén',
      'Đóng cửa và ghi nhận'
    ]
  },
  {
    id: 'hongxuongsentai-185',
    name: 'Họng xuống sên tải',
    code: '185',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện thiết bị',
      'Mở cửa kiểm tra họng xuống',
      'Vệ sinh sạch nguyên liệu bám dính bên trong',
      'Kiểm tra không bị tắc',
      'Thổi sạch bằng khí nén',
      'Đóng cửa và ghi nhận'
    ]
  },
  {
    id: 'hongxuongsentai-195',
    name: 'Họng xuống sên tải',
    code: '195',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt điện thiết bị',
      'Mở cửa kiểm tra họng xuống',
      'Vệ sinh sạch nguyên liệu bám dính bên trong',
      'Kiểm tra không bị tắc',
      'Thổi sạch bằng khí nén',
      'Đóng cửa và ghi nhận'
    ]
  },
  {
    id: 'dauquay-570',
    name: 'Đầu quay',
    code: '570',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt nguồn thiết bị',
      'Mở nắp đầu quay',
      'Vệ sinh sạch nguyên liệu bám trong đầu quay',
      'Kiểm tra ổ bi và trục quay',
      'Dùng khí nén thổi sạch',
      'Đóng nắp và kiểm tra'
    ]
  },
  {
    id: 'dauquay-196',
    name: 'Đầu quay',
    code: '196',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt nguồn thiết bị',
      'Mở nắp đầu quay',
      'Vệ sinh sạch nguyên liệu bám trong đầu quay',
      'Kiểm tra ổ bi và trục quay',
      'Dùng khí nén thổi sạch',
      'Đóng nắp và kiểm tra'
    ]
  },
  {
    id: 'dauquay-186',
    name: 'Đầu quay',
    code: '186',
    category: 'Vận chuyển',
    line: 'Intake',
    instructions: [
      'Ngắt nguồn thiết bị',
      'Mở nắp đầu quay',
      'Vệ sinh sạch nguyên liệu bám trong đầu quay',
      'Kiểm tra ổ bi và trục quay',
      'Dùng khí nén thổi sạch',
      'Đóng nắp và kiểm tra'
    ]
  }
];

// Get unique categories (optionally filtered by line)
function getCategories(line) {
  let list = EQUIPMENT_LIST;
  if (line && line !== 'all') {
    list = list.filter(eq => eq.line === line);
  }
  return [...new Set(list.map(eq => eq.category))];
}

// Get unique lines
function getLines() {
  return [...new Set(EQUIPMENT_LIST.map(eq => eq.line))];
}

// Category icons
const CATEGORY_ICONS = {
  'Trộn': '⚙️',
  'Sàng lọc': '🔍',
  'Lọc': '🧲',
  'Chứa': '📦',
  'Vận chuyển': '🔄',
  'Phân phối': '🔀',
  'Ống dẫn': '🔧'
};

// Line icons
const LINE_ICONS = {
  'Mixer': '🏭',
  'Intake': '📥'
};
