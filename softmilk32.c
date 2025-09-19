#include <stdio.h>
#include <stdint.h>
#include <string.h>

int main() {
    // 256색 팔레트 (R, G, B 각각 1바이트)
    uint8_t palette[256][3] = {0};

    // 전체 256색 팔레트
    const char *hexColors[256] = {
        // 기존 46개 (인덱스 0-45)
        "000000",
        "D95B9A", "9E4491", "633662", "903D62", "BD515A", "D69A4E", "F3D040", "FFE88C",
        "F2F2F0", "94E092", "1F9983", "22636B", "C56876", "5C3841", "945848", "D17F6B",
        "EB9F7F", "F1C28F", "B9B5C3", "76747D", "57546F", "23213D", "454194", "425BBD",
        "4884D4", "45A1DE", "7CD8EB", "E2F266", "C3D442", "82AA28", "597F1E", "376129",
        "000000", "266433", "29973B", "328E41", "3ABE41", "6ADD4B",
        "165C88", "1E7CB8", "2996DB", "5AAEE4", "60D0C0", "E8F8D0", "FFFFFF",

        // RPG 지형 색상 (46-85)
        "8B7355", "A0826D", "C19A6B", "D2B48C", "DEB887", "F5DEB3",  // 모래/사막
        "654321", "8B4513", "A0522D", "D2691E", "CD853F", "DEB887",  // 흙/대지
        "228B22", "32CD32", "00FF00", "7CFC00", "7FFF00", "ADFF2F",  // 초원
        "006400", "008000", "2E8B57", "3CB371", "66CDAA", "8FBC8F",  // 깊은 숲
        "708090", "778899", "B0C4DE", "C0C0C0", "D3D3D3", "DCDCDC",  // 돌/바위
        "E0FFFF", "F0FFFF", "F5FFFA", "FAFAD2", "FFEFD5", "FFF8DC",  // 눈/얼음

        // RPG 원소 색상 (86-115)
        "FF0000", "FF4500", "FF6347", "FF7F50", "FFA500", "FFB347",  // 불/화염
        "0000CD", "0000FF", "1E90FF", "4169E1", "4682B4", "5F9EA0",  // 물/얼음
        "FFFF00", "FFD700", "FFA500", "FF8C00", "FF7F50", "FF6347",  // 번개/빛
        "4B0082", "6A0DAD", "7B68EE", "8A2BE2", "9370DB", "9966CC",  // 어둠/독
        "90EE90", "98FB98", "00FA9A", "00FF7F", "3CB371", "2E8B57",  // 자연/독

        // RPG 장비/아이템 색상 (116-155)
        "C0C0C0", "D3D3D3", "DCDCDC", "E5E5E5", "F5F5F5", "FFFFFF",  // 일반 장비
        "87CEEB", "87CEFA", "00BFFF", "5F9EA0", "4682B4", "B0E0E6",  // 희귀 장비
        "9370DB", "8B7AB8", "7B68EE", "6A5ACD", "9966CC", "BA55D3",  // 에픽 장비
        "FFD700", "FFC700", "FFB700", "FFA700", "FF9700", "FF8700",  // 전설 장비
        "FF1493", "FF69B4", "FFB6C1", "FFC0CB", "FFDAB9", "FFE4E1",  // 신화 장비
        "8B0000", "A52A2A", "B22222", "DC143C", "FF0000", "FF6347",  // 체력 포션
        "00008B", "0000CD", "4169E1", "4682B4", "5F9EA0", "87CEEB",  // 마나 포션

        // NES 팔레트 (156-195)
        "7C7C7C", "0000FC", "0000BC", "4428BC", "940084", "A80020",
        "A81000", "881400", "503000", "007800", "006800", "005800",
        "004058", "000000", "000000", "000000", "BCBCBC", "0078F8",
        "0058F8", "6844FC", "D800CC", "E40058", "F83800", "E45C10",
        "AC7C00", "00B800", "00A800", "00A844", "008888", "000000",
        "F8F8F8", "3CBCFC", "6888FC", "9878F8", "F878F8", "F85898",
        "F87858", "FCA044", "F8B800", "B8F818", "58D854", "58F898",

        // 게임보이 팔레트 (196-215)
        "0F380F", "306230", "8BAC0F", "9BBC0F",  // 게임보이 그린
        "E0F8D0", "88C070", "346856", "081820",  // 게임보이 포켓
        "FFE4C2", "DCB45A", "A68B3C", "4C3024",  // 게임보이 라이트
        "E8E8E8", "A0A0A0", "585858", "101010",  // 게임보이 그레이
        "F8E8C8", "D89048", "A82820", "301850",  // 게임보이 브라운

        // PICO-8 팔레트 (216-231)
        "000000", "1D2B53", "7E2553", "008751", "AB5236", "5F574F",
        "C2C3C7", "FFF1E8", "FF004D", "FFA300", "FFEC27", "00E436",
        "29ADFF", "83769C", "FF77A8", "FFCCAA",

        // 추가 RPG 테마 색상 (232-255)
        "2F4F4F", "696969", "708090", "778899", "836FFF", "8470FF",  // 던전
        "8B7D6B", "8B7355", "8B6969", "8B6508", "8B5A2B", "8B4789",  // 동굴
        "CD5C5C", "F08080", "FA8072", "E9967A", "FFA07A", "FF7F50",  // 용암
        "20B2AA", "48D1CC", "40E0D0", "00CED1", "5F9EA0", "4682B4"   // 수중
    };

    int totalColors = sizeof(hexColors) / sizeof(hexColors[0]);

    // HEX → RGB 변환 후 팔레트에 저장
    for (int i = 0; i < totalColors; i++) {
        unsigned int r, g, b;
        sscanf(hexColors[i], "%02X%02X%02X", &r, &g, &b);
        palette[i][0] = (uint8_t)r;
        palette[i][1] = (uint8_t)g;
        palette[i][2] = (uint8_t)b;
    }

    // dmtd.pal 파일로 RAW 팔레트 저장
    FILE *fp = fopen("DMTD.PAL", "wb");
    if (!fp) {
        perror("파일 생성 실패");
        return 1;
    }

    size_t written = fwrite(palette, 1, sizeof(palette), fp);
    fclose(fp);

    if (written != sizeof(palette)) {
        fprintf(stderr, "파일 저장 중 오류 발생 (written=%zu)\n", written);
        return 1;
    }

    printf("dmtd.pal 파일 생성 완료 (크기: %zu bytes)\n", written);

    // 검증 로직: 등록한 모든 팔레트 색상 → HEX로 다시 변환해 비교
    printf("\n[검증 결과]\n");
    for (int i = 0; i < totalColors; i++) {
        char convertedHex[7];
        sprintf(convertedHex, "%02X%02X%02X", palette[i][0], palette[i][1], palette[i][2]);

        if (strcasecmp(convertedHex, hexColors[i]) == 0) {
            printf("%2d: OK   (원본: %s, 변환: %s)\n", i, hexColors[i], convertedHex);
        } else {
            printf("%2d: FAIL (원본: %s, 변환: %s)\n", i, hexColors[i], convertedHex);
        }
    }

    return 0;
}
