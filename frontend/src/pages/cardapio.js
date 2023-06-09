import Cabecalho from '../components/Cabecalho/cabecalho';
import ItensBox from '../components/Item/Item';
import Navbar from '../components/Navbar/Navbar';
import React, {useEffect} from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CombosAtom, BebidasAtom, SobremesasAtom, itemSelecionadoAtom, ModalItemSelector } from '../states/cardapio';
import '../styles/cardapio.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Button from "../components/Botao/button";
import logo from "../assets/images/logo.png";
import Modal from "react-modal";
import { setItensCarrinho } from '../services/carrinho';
import { CarrinhoAtom } from '../states/carrinho';
import AuthComponent from '../components/Auth';
import api from '../services/api';


export default function Cardapio(){

    const [item] = useRecoilState(itemSelecionadoAtom);
    const [comboBox, setCombo] = useRecoilState(CombosAtom);
    const [bebidasBox, setBebidas] = useRecoilState(BebidasAtom);
    const [sobremesasBox, setSobremesas] = useRecoilState(SobremesasAtom);

    async function LoadResources () {
        const itens = await api.get('/item');
        const splitItens = itens.data.reduce((prev, v) => {
            if(v.type) prev[v.type].push({
                nome:v.name,
                itens:v.itens,
                preco:'R$ '+ String(v?.price).replace(/\./g, ','),
                tipo:v.type
            });
            return prev;
        }, {combo:[], bebida:[], sobremesa:[]});

        console.log(splitItens)

        setCombo({tipo:"Combos", list:splitItens.combo});
        setBebidas({tipo:"Bebidas", list:splitItens.bebida});
        setSobremesas({tipo:"Sobremesas", list:splitItens.sobremesa});

    }

    useEffect(() => {
        LoadResources ();
    }, []);
    
    return(
        <div className='cardapioPrincipal'>
            <AuthComponent redirect={'/'}/>
            <ModalComponent isOpen={!!item} overlayClassName="modal-overlay" className="modal-content"/>
            <div className='sticky-pos'>
                <Cabecalho/>
                <Navbar/>
            </div>
            <ItensBox id='combos' tipo={comboBox.tipo} list={comboBox.list}/>
            <ItensBox id='bebidas' tipo={bebidasBox.tipo} list={bebidasBox.list}/>
            <ItensBox id='sobremesas' tipo={sobremesasBox.tipo} list={sobremesasBox.list}/>
        </div>
    );
}

function ModalComponent ({isOpen, overlayClassName, className}) {
    
    const [_, setItem] = useRecoilState(itemSelecionadoAtom);

    const ModalInfo = useRecoilValue(ModalItemSelector);

    const [carrinho, setCarrinha] = useRecoilState(CarrinhoAtom)


    function adicionarItem(){
        setCarrinha([...carrinho, ModalInfo])
        closeModal();
    }

    function closeModal(){
        setItem(null);
    }

    useEffect(() => {
        setItensCarrinho(carrinho)
    }, [carrinho]);

    return (
        <Modal
            isOpen={isOpen}
            overlayClassName={overlayClassName}
            className={className}
        > 
            <header className='modalHeader'>
                <div className='modal-topo'>
                    <button onClick={closeModal} className='btn-voltar'> 
                        <FontAwesomeIcon icon={faArrowLeft} className='icone-seta'/>
                    </button>
                    <h2>{ModalInfo?.nome}</h2>
                </div> 
            </header>
            <main>
              <div className='modal-itens'>
                  <div className='modal-descricao'> 
                    {/* essa aqui fica na esquerda, com flex-direction column */}
                    {
                        ModalInfo.tipo === 'combo'
                        ? ModalInfo.itens.map(v => (<p>{v}</p>))
                        : (<p>1x {ModalInfo.nome}</p>)
                    }
                    <p>{ModalInfo.preco}</p>
                    </div>
                    <div className='modal-img'>
                        {/* essa aqui fica na direita, só com a img */}
                        <img src={logo} alt="logo" className='logoModal'/>
                    </div>
              </div>
            </main>
            <footer className='footerModal'>
              <Button texto="Adicionar" className='modal-add' onClick={adicionarItem}/>
            </footer>
        </Modal>
    )
}