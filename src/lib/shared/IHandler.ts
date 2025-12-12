/**
 * Interfaz para comandos y queries a realizar,
 * El primer parametro es el objeto de parametros de entrada, el segundo es la respuesta esperada.
 * Se tipa directamente como Promise ya que todos los handlers son asincronos.
 */
export interface IHandler<TParameterObject, TResponse> {
    execute(command: TParameterObject): Promise<TResponse>;
}