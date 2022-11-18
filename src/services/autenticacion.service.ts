import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Llaves} from '../config/llaves';
import {Persona} from '../models';
import {PersonaRepository} from '../repositories';
const generador = require("password-generator"); // IMPORTAMOS PAQUETE PASSWORD PREVIAMENTE INSTALADO EN CONSOLA
const cryptoJs = require("crypto-js");   // IMPORTAMOS PAQUETE CRYPTO-JS PREVIAMENTE INSTALADO EN CONSOLA
const jwt = require("jsonwebtoken");  //IMPORTAMO PAQUETE JSONWEBTOKEN PREVIAMENTE INSTALADO EN CONSOLA
@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(PersonaRepository)
    public PersonaRepository: PersonaRepository
  ) { }

  /*
   * Add service methods here
   */

  GeneradorClave() {
    let clave = generador(8, false);
    console.log(clave);
    return clave;
  }

  CifrarClave(clave: string) {
    let claveCifrada = cryptoJs.MD5(clave).toString(); //MD5 es un metodo de cifrado
    console.log(claveCifrada)
    return claveCifrada;
  }

  IdentificacionPersona(usuario: string, clave: string) {
    try {
      let p = this.PersonaRepository.findOne({where: {correo: usuario, clave: clave}})
      if (p) {
        return p;
      }
      return false;

    } catch {
      return false;
    }
  }

  GenerarTokenJWT(persona: Persona) {
    let token = jwt.sign({      // ES LA FIRMA DEL TOKEN
      data: {
        id: persona.id,
        correo: persona.correo,
        nombres: persona.nombre + " " + persona.apellidos
      }
    },
      Llaves.ClaveJWT);
    return token;
  }

  ValidarTokenJWT(token: string) {
    try {
      let datos = jwt.verify(token, Llaves.ClaveJWT);  //EL METODO VERIFY SIRVE PARA VERIFICAR EL TOKEN Y AQUI SE VERFICA CON UNA CLAVE
      return datos;
    } catch {
      return false;
    }
  }

}
