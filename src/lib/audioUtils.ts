
// Funções utilitárias para áudio

/**
 * Toca um arquivo de som.
 * @param soundFile O nome do arquivo de som (ex: 'correct.mp3') localizado na pasta /public/sounds/
 */
export function playSound(soundFile: string): void {
  // Descomente as linhas abaixo quando você tiver os arquivos de som em /public/sounds/
  /*
  if (typeof window !== 'undefined') {
    try {
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.play().catch(error => console.warn(`Erro ao tocar o som ${soundFile}:`, error));
    } catch (error) {
      console.warn(`Não foi possível tocar o som ${soundFile}:`, error);
    }
  }
  */
  // Linha de log para simular o som enquanto comentado:
  console.log(`Simulando som: ${soundFile}`);
}
