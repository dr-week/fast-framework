// [Android NDK C++23 Native Driver] — Zero-Copy DirectBuffer Bridge
// Compiles with Android NDK r27+ Clang targeting arm64-v8a / armeabi-v7a / x86_64

#include <jni.h>
#include <cstdint>
#include <android/log.h>

#define LOG_TAG "ZuariNDK"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

#pragma pack(push, 8)
struct QuantumTelemetryFrame {
    uint32_t frame_tick;   // offset: +0B
    uint32_t _pad0;        // 8-byte alignment padding
    double   harmonic_pos; // offset: +8B
    float    plasma_flux;  // offset: +16B
    uint32_t _pad1;        // total struct size: 24B
};
#pragma pack(pop)

extern "C" {

JNIEXPORT jdouble JNICALL
Java_com_zuari_kernel_QuantumTelemetryFrame_nativeStep(
    JNIEnv* env,
    jobject /* this */,
    jobject directByteBuffer,
    jdouble velocity,
    jdouble stiffness
) {
    if (!directByteBuffer) return 0.0;
    
    // GetDirectBufferAddress bypasses JNI copy overhead entirely
    auto* frame = static_cast<QuantumTelemetryFrame*>(env->GetDirectBufferAddress(directByteBuffer));
    if (!frame) return 0.0;

    frame->frame_tick += 1;
    frame->harmonic_pos += velocity * stiffness;
    return frame->harmonic_pos;
}

}
