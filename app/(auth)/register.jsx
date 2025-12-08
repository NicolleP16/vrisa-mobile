import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthAPI } from '../../src/shared/api';
import { formatApiErrors } from '../../src/shared/utils';
import { ORGANIZATION_ROLES } from '../../src/shared/constants/roles';

/**
 * Pantalla de registro de nuevos usuarios.
 * Permite registrarse como ciudadano o solicitar un rol de organización.
 */
export default function RegisterScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    belongsToOrganization: null, // null = sin seleccionar, true = Sí, false = No
    requestedRole: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Roles disponibles para usuarios que pertenecen a una organización
  const organizationRoles = [
    { value: ORGANIZATION_ROLES.STATION_ADMIN, label: "Administrador de estación" },
    { value: ORGANIZATION_ROLES.RESEARCHER, label: "Investigador" },
    { value: ORGANIZATION_ROLES.INSTITUTION, label: "Institución" },
  ];

  /**
   * Actualiza un campo específico del formulario
   */
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Maneja la selección de si pertenece a una organización
   */
  const handleOrganizationChange = (belongsToOrg) => {
    setFormData(prev => ({
      ...prev,
      belongsToOrganization: belongsToOrg,
      requestedRole: belongsToOrg ? "" : "citizen" // Si no pertenece, es ciudadano
    }));
    setIsDropdownOpen(false);
  };

  /**
   * Maneja la selección de rol
   */
  const handleRoleSelect = (roleValue) => {
    setFormData(prev => ({ ...prev, requestedRole: roleValue }));
    setIsDropdownOpen(false);
  };

  /**
   * Maneja el proceso de registro
   */
  const handleRegister = async () => {
    // Validaciones básicas
    if (!formData.username || !formData.email || !formData.password || !formData.phone) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (formData.belongsToOrganization === null) {
      Alert.alert('Error', 'Por favor, indica si perteneces a una organización ambiental');
      return;
    }

    if (formData.belongsToOrganization && !formData.requestedRole) {
      Alert.alert('Error', 'Por favor, selecciona el rol que deseas solicitar');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.username,
        last_name: "Usuario", // Valor por defecto temporal
        phone: formData.phone,
        belongs_to_organization: formData.belongsToOrganization,
        requested_role: formData.requestedRole || "citizen",
        role_id: null,
        institution_id: null,
      };

      await AuthAPI.register(payload);

      Alert.alert(
        'Registro exitoso',
        'Usuario registrado correctamente. Por favor inicia sesión.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/')
          }
        ]
      );
    } catch (err) {
      const messages = formatApiErrors(err, 'Ocurrió un error inesperado');
      Alert.alert('Error al registrar', messages.join('\n'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene el texto del botón según el estado del formulario
   */
  const getButtonText = () => {
    if (loading) return "Registrando...";
    if (formData.belongsToOrganization === false) return "Registrarse como ciudadano";
    if (formData.requestedRole) {
      const roleName = organizationRoles.find(r => r.value === formData.requestedRole)?.label || 'usuario';
      return `Solicitar registro como ${roleName}`;
    }
    return "Registrarse";
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-white pt-12 pb-4 px-6 border-b border-slate-200">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <Ionicons name="arrow-back" size={24} color="#334155" />
            <Text className="ml-2 text-slate-700 font-medium">Ir a Inicio</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-blue-600">VriSA</Text>
        </View>

        <View className="px-6 py-8">
          {/* Título */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-slate-900">¡Regístrate!</Text>
            <Text className="text-slate-600 mt-2">
              Crea una cuenta para gestionar tus estaciones o acceder a reportes de calidad del aire
            </Text>
          </View>

          {/* Formulario */}
          <View className="space-y-5">
            {/* Nombre de usuario */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                <Text className="text-red-500">* </Text>Nombre de usuario
              </Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-4 py-3 text-base bg-white"
                placeholder="Ingresa un nombre de usuario"
                value={formData.username}
                onChangeText={(value) => updateField('username', value)}
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                <Text className="text-red-500">* </Text>Correo electrónico
              </Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-4 py-3 text-base bg-white"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Teléfono */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                <Text className="text-red-500">* </Text>Teléfono de contacto
              </Text>
              <TextInput
                className="border border-slate-300 rounded-lg px-4 py-3 text-base bg-white"
                placeholder="Ingresa tu número de teléfono"
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            {/* Contraseña */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                <Text className="text-red-500">* </Text>Contraseña
              </Text>
              <View className="relative">
                <TextInput
                  className="border border-slate-300 rounded-lg px-4 py-3 pr-12 text-base bg-white"
                  placeholder="Establezca una contraseña"
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar contraseña */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                <Text className="text-red-500">* </Text>Confirmar contraseña
              </Text>
              <View className="relative">
                <TextInput
                  className={`border rounded-lg px-4 py-3 pr-12 text-base bg-white ${
                    formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-500'
                      : 'border-slate-300'
                  }`}
                  placeholder="Confirme su contraseña"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateField('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword ? (
                  <View className="absolute right-3 top-3">
                    <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={24} 
                      color="#64748b" 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* ¿Pertenece a una organización? */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-3">
                <Text className="text-red-500">* </Text>¿Pertenece usted a una organización ambiental?
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleOrganizationChange(true)}
                  className={`flex-1 flex-row items-center border-2 rounded-lg px-4 py-3 ${
                    formData.belongsToOrganization === true
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-300 bg-white'
                  }`}
                  disabled={loading}
                >
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    formData.belongsToOrganization === true
                      ? 'border-blue-500'
                      : 'border-slate-300'
                  }`}>
                    {formData.belongsToOrganization === true && (
                      <View className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </View>
                  <Text className={`ml-3 font-medium ${
                    formData.belongsToOrganization === true
                      ? 'text-blue-700'
                      : 'text-slate-700'
                  }`}>
                    Sí
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleOrganizationChange(false)}
                  className={`flex-1 flex-row items-center border-2 rounded-lg px-4 py-3 ${
                    formData.belongsToOrganization === false
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-300 bg-white'
                  }`}
                  disabled={loading}
                >
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    formData.belongsToOrganization === false
                      ? 'border-blue-500'
                      : 'border-slate-300'
                  }`}>
                    {formData.belongsToOrganization === false && (
                      <View className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </View>
                  <Text className={`ml-3 font-medium ${
                    formData.belongsToOrganization === false
                      ? 'text-blue-700'
                      : 'text-slate-700'
                  }`}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Selector de rol (solo si pertenece a organización) */}
            {formData.belongsToOrganization === true && (
              <View>
                <Text className="text-sm font-medium text-slate-700 mb-2">
                  <Text className="text-red-500">* </Text>Escoja el rol que desea solicitar
                </Text>
                <TouchableOpacity
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="border border-slate-300 rounded-lg px-4 py-3 bg-white flex-row justify-between items-center"
                  disabled={loading}
                >
                  <Text className={formData.requestedRole ? 'text-slate-900' : 'text-slate-400'}>
                    {formData.requestedRole
                      ? organizationRoles.find(r => r.value === formData.requestedRole)?.label
                      : "Selecciona un rol"}
                  </Text>
                  <Ionicons 
                    name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#64748b" 
                  />
                </TouchableOpacity>

                {isDropdownOpen && (
                  <View className="mt-2 border border-slate-200 rounded-lg bg-white overflow-hidden">
                    {organizationRoles.map((role, index) => (
                      <TouchableOpacity
                        key={role.value}
                        onPress={() => handleRoleSelect(role.value)}
                        className={`px-4 py-3 ${
                          index < organizationRoles.length - 1 ? 'border-b border-slate-100' : ''
                        } ${formData.requestedRole === role.value ? 'bg-blue-50' : ''}`}
                      >
                        <Text className={`${
                          formData.requestedRole === role.value 
                            ? 'text-blue-700 font-medium' 
                            : 'text-slate-700'
                        }`}>
                          {role.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Mensaje para ciudadanos */}
            {formData.belongsToOrganization === false && (
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="person" size={18} color="#3b82f6" />
                  </View>
                  <Text className="text-blue-900 font-semibold">
                    Te registrarás como <Text className="font-bold">Ciudadano</Text>
                  </Text>
                </View>
                <Text className="text-blue-700 text-sm leading-5">
                  Como ciudadano tendrás acceso a consultar reportes de calidad del aire y datos de las estaciones de monitoreo.
                </Text>
              </View>
            )}

            {/* Botón de Registro */}
            <TouchableOpacity
              className={`rounded-lg py-4 mt-6 ${
                loading ? 'bg-slate-400' : 'bg-blue-600'
              }`}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center text-base font-semibold">
                  {getButtonText()}
                </Text>
              )}
            </TouchableOpacity>

            {/* Link a Login */}
            <View className="flex-row justify-center mt-6 pb-8">
              <Text className="text-slate-600">¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-blue-600 font-semibold">Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}